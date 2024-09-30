import {
  populateCompany, populatePhotos,
  populateTrackEdit, populateTrackView,
  requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord
} from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IfileMeta, IfilterAggResponse, IfilterProps, Iitem, IreqHasPhotos, Isponsored, Isuccess, Iuser
} from '@open-stock/stock-universal';
import {
  addParentToLocals,
  appendBody, appendUserToReqIfTokenExist,
  constructFiltersFromBody, deleteAllFiles, deleteFiles, fileMetaLean,
  generateUrId,
  lookupLimit, lookupOffset, lookupSort, lookupTrackEdit, lookupTrackView,
  makeCompanyBasedQuery, makePredomFilter, offsetLimitRelegator, requireAuth,
  roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectId, verifyObjectIds
} from '@open-stock/stock-universal-server';
import express, { Request, Response } from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { itemLean, itemMain } from '../models/item.model';
import { itemDecoyMain } from '../models/itemdecoy.model';
import { itemOfferMain } from '../models/itemoffer.model';
import { getDecoyFromBehaviour, registerSearchParams, todaysRecomendation } from '../utils/user-behavoiur';

/** The logger for the item routes */
const itemRoutesLogger = tracer.colorConsole({
  format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
  dateformat: 'HH:MM:ss.L',
  transport(data) {
    // eslint-disable-next-line no-console
    console.log(data.output);
    const logDir = path.join(process.cwd() + '/openstockLog/');

    fs.mkdir(logDir, { recursive: true }, (err) => {
      if (err) {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('data.output err ', err);
        }
      }
    });
    fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('raw.output err ', err);
      }
    });
  }
});

/**
 * Express router for item routes.
 */
export const itemRoutes = express.Router();

export const addReview = async(req: Request, res: Response): Promise<Response> => {
  const { itemId, userId } = req.body.review;
  const isValid = verifyObjectId(itemId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const item = await itemMain
    .findByIdAndUpdate(itemId);

  if (!item) {
    return res.status(404).send({ success: false });
  }
  item.reviewedBy.push(userId || 'tourer');
  item.reviewCount++;
  item.reviewRatingsTotal += req.body.review.rating;
  item.reviewWeight = item.reviewRatingsTotal / item.reviewedBy.length; // <= 10
  let errResponse: Isuccess;
  const saved = await item.save()
    .catch(err => {
      itemRoutesLogger.error('addReview - err: ', err);
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
        errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
      }

      return errResponse;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  return res.status(200).send({ success: Boolean(saved) });
};

export const removeReview = async(req: IcustomRequest<never, { user: Iuser }>, res: Response): Promise<Response> => {
  const { userId } = req.user;
  const { filter } = makeCompanyBasedQuery(req);
  const { itemId, rating } = req.params;
  const isValid = verifyObjectIds([itemId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const item = await itemMain
    .findOneAndUpdate({ _id: itemId, ...filter });

  if (!item) {
    return res.status(404).send({ success: false });
  }
  const found = item.reviewedBy
    .find(val => val === userId || 'tourer');

  if (!found) {
    return res.status(404).send({ success: false });
  }
  const indexOf = item.reviewedBy
    .indexOf(found);

  item.reviewedBy.splice(indexOf);
  item.reviewCount--;
  item.reviewRatingsTotal -= parseInt(rating, 10);
  item.reviewWeight = item.reviewRatingsTotal / item.reviewedBy.length;
  let errResponse: Isuccess;

  await item.save().catch(err => {
    errResponse = {
      success: false,
      status: 403
    };
    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }

    return errResponse;
  });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  return res.status(200).send({ success: true });
};

itemRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  requireCanUseFeature('item'),
  roleAuthorisation('items', 'create'),
  async(req: IcustomRequest<never, { item: Iitem }>, res, next): Promise<Response> => {
    const { item } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    item.companyId = filter.companyId;

    item.urId = await generateUrId(itemMain);
    const newProd = new itemMain(item);
    let errResponse: Isuccess;
    const saved = await newProd.save()
      .catch(err => {
        itemRoutesLogger.error('create - err: ', err);
        errResponse = {
          success: false,
          status: 403
        };
        if (err && err.errors) {
          errResponse.err = stringifyMongooseErr(err.errors);
        } else {
          errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }

        return err;
      });

    if (errResponse) {
      return res.status(403).send(errResponse);
    }

    if (saved && saved._id) {
      addParentToLocals(res, saved._id, itemMain.collection.collectionName, 'makeTrackEdit');
    }

    if (!Boolean(saved)) {
      return res.status(403).send('unknown error');
    }

    next();
  },
  requireUpdateSubscriptionRecord('item')
);

itemRoutes.post(
  '/add/img',
  requireAuth,
  requireActiveCompany,
  requireCanUseFeature('item'),
  roleAuthorisation('items', 'create'),
  uploadFiles,
  appendBody,
  saveMetaToDb,
  async(req: IcustomRequest<never, {
    item: Iitem; newVideos: IfileMeta;} & IreqHasPhotos>, res, next): Promise<Response> => {
    const item = req.body.item;
    const { filter } = makeCompanyBasedQuery(req);

    item.companyId = filter.companyId;
    item.ecomerceCompat = true;

    item.urId = await generateUrId(itemMain);
    const parsed = req.body;

    if (parsed && parsed.newPhotos) {
      item.photos = parsed.newPhotos;
    }
    if (parsed && parsed.newVideos) {
      item.video = parsed.newVideos[0];
    }
    const newProd = new itemMain(item);
    let errResponse: Isuccess;
    const saved = await newProd.save()
      .catch(err => {
        itemRoutesLogger.error('create - err: ', err);
        errResponse = {
          success: false,
          status: 403
        };
        if (err && err.errors) {
          errResponse.err = stringifyMongooseErr(err.errors);
        } else {
          errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }

        return err;
      });

    if (errResponse) {
      return res.status(403).send(errResponse);
    }

    if (saved && saved._id) {
      addParentToLocals(res, saved._id, itemMain.collection.collectionName, 'makeTrackEdit');
    }

    if (!Boolean(saved)) {
      return res.status(403).send('unknown error');
    }

    next();
  },
  requireUpdateSubscriptionRecord('item')
);

itemRoutes.put(
  '/update',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'update'),
  async(req: IcustomRequest<never, { item: Iitem }>, res): Promise<Response> => {
    const updatedProduct = req.body.item;
    const { filter } = makeCompanyBasedQuery(req);

    updatedProduct.companyId = filter.companyId;

    // const { _id } = updatedProduct;
    const isValid = verifyObjectIds([updatedProduct._id]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }


    const item = await itemMain
      .findOne({ _id: updatedProduct._id, ...filter });

    if (!item) {
      return res.status(404).send({ success: false });
    }

    if (!item.urId || item.urId === '0') {
      item.urId = await generateUrId(itemMain);
    }

    delete updatedProduct._id;

    const keys = Object.keys(updatedProduct);

    keys.forEach(key => {
      if (item[key] && key !== '_id') {
        item[key] = updatedProduct[key] || item[key];
      }
    });
    let errResponse: Isuccess;
    const updated = await item.save()
      .catch(err => {
        itemRoutesLogger.error('update - err: ', err);
        errResponse = {
          success: false,
          status: 403
        };
        if (err && err.errors) {
          errResponse.err = stringifyMongooseErr(err.errors);
        } else {
          errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }

        return errResponse;
      });

    if (errResponse) {
      return res.status(403).send(errResponse);
    }

    return res.status(200).send({ success: Boolean(updated) });
  }
);

itemRoutes.post(
  '/update/img',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'update'),
  uploadFiles,
  appendBody,
  saveMetaToDb,
  async(req: IcustomRequest<never, { item: Iitem; newVideos: string[] } & IreqHasPhotos>, res) => {
    const updatedProduct = req.body.item;
    const { filter } = makeCompanyBasedQuery(req);

    const { _id } = updatedProduct;
    const isValid = verifyObjectIds([_id]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemMain
      .findOne({ _id, ...filter });

    if (!item) {
      return res.status(404).send({ success: false });
    }

    if (!item.urId || item.urId === '0') {
      item.urId = await generateUrId(itemMain);
    }

    const parsed = req.body;

    if (parsed && parsed.newPhotos) {
      const oldPhotos = item.photos || [];

      item.photos = [...oldPhotos, ...parsed.newPhotos] as string[];
    }

    if (parsed && parsed.newVideos) {
      const meta = await fileMetaLean.findById(item.video);

      if (meta) {
        await deleteAllFiles([meta], true);
      }
      item.video = parsed.newVideos[0];
    }

    delete updatedProduct._id;

    const keys = Object.keys(updatedProduct);

    keys.forEach(key => {
      if (item[key]) {
        item[key] = updatedProduct[key] || item[key];
      }
    });
    let errResponse: Isuccess;
    const updated = await item.save()
      .catch(err => {
        itemRoutesLogger.error('updateimg - err: ', err);
        errResponse = {
          success: false,
          status: 403
        };
        if (err && err.errors) {
          errResponse.err = stringifyMongooseErr(err.errors);
        } else {
          errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }

        return errResponse;
      });

    if (errResponse) {
      return res.status(403).send(errResponse);
    }

    return res.status(200).send({ success: Boolean(updated) });
  }
);

itemRoutes.put('/like/:itemId', requireAuth, async(req: IcustomRequest<never, unknown>, res) => {
  const { filter } = makeCompanyBasedQuery(req);
  const { userId } = req.user;
  const { itemId } = req.params;
  const isValid = verifyObjectIds([itemId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const item = await itemMain
    .findOneAndUpdate({ _id: itemId, ...filter });

  if (!item) {
    return res.status(404).send({ success: false });
  }
  item.likes.push(userId);
  item.likesCount++;
  let errResponse: Isuccess;

  await item.save().catch(err => {
    errResponse = {
      success: false,
      status: 403
    };
    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }

    return errResponse;
  });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  return res.status(200).send({ success: true });
});

itemRoutes.put('/unlike/:itemId', requireAuth, async(req: IcustomRequest<never, unknown>, res) => {
  const { companyId } = req.user;
  const { userId } = req.user;
  const { itemId } = req.params;
  const isValid = verifyObjectIds([itemId, companyId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const item = await itemMain
    .findOneAndUpdate({ _id: itemId });

  if (!item) {
    return res.status(404).send({ success: false });
  }
  item.likes = item.likes.filter(val => val !== userId);
  item.likesCount--;
  let errResponse: Isuccess;

  await item.save().catch(err => {
    errResponse = {
      success: false,
      status: 403
    };
    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }

    return errResponse;
  });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  return res.status(200).send({ success: true });
});

itemRoutes.get(
  '/one/:urId',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ urId: string }, null>, res) => {
    const { urId } = req.params;
    const filter = { urId } as object;

    const item = await itemLean
      .findOne({ ...filter })
      .populate([populatePhotos(true), populateCompany()])
      .lean();

    if (!item || !item.companyId) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, item._id, itemMain.collection.collectionName, 'trackDataView');

    return res.status(200).send(item);
  }
);

itemRoutes.get(
  '/all/:offset/:limit/:ecomerceCompat',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{
    offset: string; limit: string; ecomerceCompat: string; }, null>, res) => {
    const { ecomerceCompat } = req.params;
    let filter = {} as object;

    if (ecomerceCompat === 'true') {
      filter = { ...filter, ecomerceCompat: true };
    }
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
      itemLean
        .find({ ...filter, ...makePredomFilter(req) })
        .skip(offset)
        .limit(limit)
        .populate([populatePhotos(true), populateCompany(), populateTrackEdit(), populateTrackView()])
        .lean(),
      itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);

    const newItems = all[0].filter(item => item.companyId);
    const response: IdataArrayResponse<Iitem> = {
      count: all[1],
      data: newItems
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

itemRoutes.get(
  '/gettodaysuggestions/:offset/:limit/:ecomerceCompat',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ limit: string }, null>, res) => {
    const { limit } = req.params;
    const { userId } = req.user;
    const stnCookie = req.signedCookies['settings'];
    const { _ids, newOffset, newLimit } = await todaysRecomendation(Number(limit), stnCookie?.userCookieId, userId);
    let filter = { ecomerceCompat: true } as object;

    if (_ids && _ids.length > 0) {
      filter = { ...filter, _id: { $in: _ids } };
    }
    const all = await Promise.all([
      itemLean
        .find({ ...filter, ...makePredomFilter(req) })
        .sort({ timesViewed: 1 })
        .skip(newOffset)
        .limit(newLimit)
        .populate([populatePhotos(true), populateCompany()])
        .lean(),
      itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response: IdataArrayResponse<Iitem> = {
      count: all[1],
      data: newItems
    };

    for (const val of newItems) {
      addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

itemRoutes.get(
  '/getbehaviourdecoy/offset/limit/:ecomerceCompat',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<never, null>, res) => {
    const { userId } = req.user;
    const stnCookie = req.signedCookies['settings'];
    const { _ids } = await getDecoyFromBehaviour(stnCookie?.userCookieId, userId);
    const all = await Promise.all([
      itemLean
        .find({ _id: { $in: _ids }, ...makePredomFilter(req) })
        .sort({ timesViewed: 1 })
        .populate([populatePhotos(true), populateCompany()])
        .lean(),
      itemLean.countDocuments({ _id: { $in: _ids }, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response: IdataArrayResponse<Iitem> = {
      count: all[1],
      data: newItems
    };

    for (const val of newItems) {
      addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

itemRoutes.get(
  '/getfeatured/:offset/:limit/:ecomerceCompat',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<never, null>, res) => {
    const { ecomerceCompat } = req.params;
    let filter = {} as object;

    if (ecomerceCompat === 'true') {
      filter = { ...filter, ecomerceCompat: true };
    }
    const all = await Promise.all([
      itemLean
        .find({ ...filter, ...makePredomFilter(req) })
        .sort({ timesViewed: 1, likesCount: 1, reviewCount: 1 })
        .populate([populatePhotos(true), populateCompany()])
        .lean(),
      itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response: IdataArrayResponse<Iitem> = {
      count: all[1],
      data: newItems
    };

    for (const val of newItems) {
      addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

/*
itemRoutes.get(
  '/filterstars/:starVal/:offset/:limit/:ecomerceCompat',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ starVal: string; ecomerceCompat: string}, null>, res) => {
    const { ecomerceCompat } = req.params;
    let filter = {} as object;

    if (ecomerceCompat === 'true') {
      filter = { ...filter, ecomerceCompat: true };
    }
    const starVal = Number(req.params.starVal);
    const all = await Promise.all([
      reviewLean
        .find({ ...filter, ...makePredomFilter(req) })
        .where('rating') // rating
        .lte(starVal + 2)
        .gte(starVal)
        .select({ itemId: 1 })
        .lean()
        .populate([populatePhotos(true), populateCompany()])
        .lean(),
      reviewLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(val => val.companyId);
    const response: IdataArrayResponse<Treview> = {
      count: all[1],
      data: newItems
    };

    for (const val of newItems) {
      addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);
*/

/*
itemRoutes.get(
  '/discount/:discountValue/:offset/:limit/:ecomerceCompat',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<never, null>, res) => {
    const { ecomerceCompat } = req.params;
    let filter = {} as object;

    if (ecomerceCompat === 'true') {
      filter = { ...filter, ecomerceCompat: true };
    }
    const { discountValue } = req.params;
    const all = await Promise.all([
      itemLean
        .find({ ...filter, ...makePredomFilter(req) })
        .or([
          {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'costMeta.offer': 'true',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'costMeta.discount': Number(discountValue)
          },
          {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'costMeta.offer': true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'costMeta.discount': Number(discountValue)
          }
        ])
        .sort({ createdAt: -1 })
        .populate([populatePhotos(true), populateCompany()])
        .lean(),
      itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const newItems = all[0].filter(item => item.companyId);
    const response: IdataArrayResponse<Iitem> = {
      count: all[1],
      data: newItems
    };

    for (const val of newItems) {
      addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);
*/

itemRoutes.post(
  '/sponsored/get',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<never, { _ids: string[]}>, res) => {
    const _ids = req.body._ids;

    const filter = { _id: { $in: _ids } } as object;

    if (_ids && _ids.length > 0) {
      for (const id of _ids) {
        const isValid = verifyObjectId(id);

        if (!isValid) {
          return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
      }
    } else {
      return res.status(403).send({ success: false, status: 403, err: 'no sponsored items provided' });
    }

    const items = await itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .lean()
      .sort({ timesViewed: 1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean();
    const newItems = items.filter(item => item.companyId);

    for (const val of newItems) {
      addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(newItems);
  }
);

itemRoutes.get(
  '/getoffered',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<never, null>, res) => {
    const filter = {} as object;

    const items = await itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .populate({ path: 'sponsored', model: itemLean,
        populate: [{
          path: 'photos', model: fileMetaLean
        }
        ]
      })
      .sort({ createdAt: -1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean();
    const newItems = items.filter(item => item.companyId);
    const filtered = newItems.filter(p => p.sponsored?.length && p.sponsored?.length > 0);

    return res.status(200).send(filtered);
  }
);

itemRoutes.put(
  '/sponsored/add/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'update'),
  async(req: IcustomRequest<{_id: string }, {sponsored: Isponsored}>, res) => {
    const { _id } = req.params;
    const { sponsored } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const item = await itemMain.findByIdAndUpdate(_id);

    if (!item) {
      return res.status(404).send({ success: false });
    }
    item.sponsored.push(sponsored);
    let errResponse: Isuccess;

    await item.save().catch(err => {
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
        errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
      }

      return errResponse;
    });

    if (errResponse) {
      return res.status(200).send({ success: true });
    }

    return res.status(200).send({ success: true });
  }
);

itemRoutes.put(
  '/sponsored/update/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'update'),
  async(req: IcustomRequest<never, {sponsored: Isponsored}>, res) => {
    const { _id } = req.params;
    const { sponsored } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const item = await itemMain.findOneAndUpdate({ _id, ...filter });

    if (!item) {
      return res.status(404).send({ success: false });
    }
    const found = item.sponsored.find(val => val.item === sponsored.item);

    if (found) {
      const indexOf = item.sponsored.indexOf(found);

      item.sponsored[indexOf] = sponsored;
    }
    let errResponse: Isuccess;

    await item.save().catch(err => {
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
        errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
      }

      return errResponse;
    });

    if (errResponse) {
      return res.status(403).send(errResponse);
    }

    return res.status(200).send({ success: true });
  }
);

itemRoutes.delete(
  '/sponsored/delete/:_id/:spnsdId',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'update'),
  async(req: IcustomRequest<{_id: string; spnsdId: string }, unknown>, res) => {
    const { _id, spnsdId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);

    const item = await itemMain.findOneAndUpdate({ _id, ...filter });

    if (!item) {
      return res.status(404).send({ success: false });
    }
    const found = item.sponsored.find(val => val.item === spnsdId);

    if (found) {
      const indexOf = item.sponsored.indexOf(found);

      item.sponsored.splice(indexOf, 1);
    }
    let errResponse: Isuccess;

    await item.save().catch(err => {
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
        errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
      }

      return errResponse;
    });

    if (errResponse) {
      return res.status(403).send(errResponse);
    }

    return res.status(200).send({ success: true });
  }
);

itemRoutes.put(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);

    // start by removing offers
    await itemOfferMain.deleteMany({ ...filter, items: { $elemMatch: { $in: [_id] } } });
    // also remove decoys
    await itemDecoyMain.deleteMany({ ...filter, items: { $elemMatch: { $in: [_id] } } });

    const found = await itemMain.findOne({ _id, ...filter })
      .populate([populatePhotos(true)])
      .populate({ path: 'video', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
      .lean();

    if (found) {
      let filesWithDir = (found as any).photos.map(photo => (
        {
          _id: photo._id,
          url: photo.url
        }
      ));

      if (found.video) {
        filesWithDir = [...filesWithDir, ...[found.video]];
      }
      await deleteAllFiles(filesWithDir);
    }

    // const deleted = await itemMain.findOneAndDelete({ _id, ...filter });
    const deleted = await itemMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, itemMain.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

itemRoutes.put(
  '/deletefiles',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'delete'),
  deleteFiles(true),
  async(req: IcustomRequest<never, { filesWithDir: IfileMeta[]; item: Iitem }>, res) => {
    const filesWithDir: IfileMeta[] = req.body.filesWithDir;
    const { filter } = makeCompanyBasedQuery(req);

    if (filesWithDir && !filesWithDir.length) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedProduct = req.body.item;

    const { _id } = updatedProduct;

    const item = await itemMain
      .findOneAndUpdate({ _id, ...filter });

    if (!item) {
      return res.status(404).send({ success: false, err: 'item not found' });
    }
    const filesWithDirIds = filesWithDir.map(val => val._id);
    const photos = item.photos;

    item.photos = photos
      .filter((p: string) => !filesWithDirIds.includes(p)) as string[];
    if (item.video && filesWithDirIds.includes(item.video as string)) {
      item.video = null;
    }
    let errResponse: Isuccess;

    await item.save().catch(err => {
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
        errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
      }

      return errResponse;
    });

    if (errResponse) {
      return res.status(403).send(errResponse);
    }

    return res.status(200).send({ success: true });
  }
);

itemRoutes.post('/filter', appendUserToReqIfTokenExist, async(
  req: IcustomRequest<null, IfilterProps>,
  res
) => {
  const { userId } = req.user;
  const { searchterm, propSort } = req.body;
  const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
  const stnCookie = req.signedCookies['settings'];
  const filter = constructFiltersFromBody(req);

  if (searchterm && userId) {
    registerSearchParams(searchterm, '', stnCookie?.userCookieId, userId);
  }

  const aggCursor = itemLean.aggregate<IfilterAggResponse<Iitem>>([
    {
      $match: {
        $and: [
          // { status: 'pending' },
          ...filter
        ]
      }
    },
    ...lookupTrackEdit(),
    ...lookupTrackView(),
    {
      $facet: {
        data: [...lookupSort(propSort), ...lookupOffset(offset), ...lookupLimit(limit)],
        total: [{ $count: 'count' }]
      }
    },
    {
      $unwind: {
        path: '$total',
        preserveNullAndEmptyArrays: true
      }
    }
  ]);

  const dataArr: IfilterAggResponse<Iitem>[] = [];

  for await (const data of aggCursor) {
    dataArr.push(data);
  }

  const all = dataArr[0]?.data || [];
  const count = dataArr[0]?.total?.count || 0;


  const newItems = all.filter(item => item.companyId);
  const response: IdataArrayResponse<Iitem> = {
    count,
    data: newItems
  };

  return res.status(200).send(response);
});

itemRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    // start by removing offers
    /* await itemOfferMain.deleteMany({  items: { $elemMatch: { $in: _ids } } }); */
    // TODO tarack ehe
    await itemOfferMain.updateOne({ ...filter, items: { $elemMatch: { $in: _ids } } }, {
      $set: { isDeleted: true }
    });
    // also remove decoys
    /* await itemDecoyMain.deleteMany({  items: { $elemMatch: { $in: _ids } } }); */
    // TODO TARC
    await itemDecoyMain.updateOne({ ...filter, items: { $elemMatch: { $in: _ids } } }, {
      $set: { isDeleted: true }
    });

    let filesWithDir: IfileMeta[];

    const alltoDelete = await itemLean.find({ _id: { $in: _ids } })
      .populate([populatePhotos(true)])
      .populate({ path: 'video', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
      .lean();

    for (const user of alltoDelete) {
      if (user.photos?.length > 0) {
        filesWithDir = [...filesWithDir, ...user.photos as IfileMeta[]];
      }
      if (user.video) {
        filesWithDir = [...filesWithDir, ...[user.video as IfileMeta]];
      }
    }

    await deleteAllFiles(filesWithDir);

    /* const deleted = await itemMain
    .deleteMany({ _id: { $in: _ids } })
    .catch(err => {
      itemRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */


    const deleted = await itemMain
      .updateMany({ _id: { $in: _ids } }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        itemRoutesLogger.error('deletemany - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      for (const val of _ids) {
        addParentToLocals(res, val, itemMain.collection.collectionName, 'trackDataDelete');
      }

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
  }
);

