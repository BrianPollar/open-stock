/**
 * @file item.routes.ts
 * @description This file contains the express routes for handling CRUD operations on item and review data.
 * @requires express
 * @requires Request
 * @requires Response
 * @requires itemLean
 * @requires itemMain
 * @requires reviewLean
 * @requires getLogger
 * @requires Icustomrequest
 * @requires Ifilewithdir
 * @requires Isuccess
 * @requires makeRandomString
 * @requires appendBody
 * @requires deleteFiles
 * @requires makeUrId
 * @requires offsetLimitRelegator
 * @requires requireAuth
 * @requires roleAuthorisation
 * @requires stringifyMongooseErr
 * @requires uploadFiles
 * @requires verifyObjectId
 * @requires verifyObjectIds
 * @requires itemOfferMain
 * @requires itemDecoyMain
 */
import { populateCompany, populatePhotos, populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { Icustomrequest, IdataArrayResponse, IfileMeta, Isuccess, makeRandomString } from '@open-stock/stock-universal';
import { addParentToLocals, appendBody, appendUserToReqIfTokenExist, deleteAllFiles, deleteFiles, fileMetaLean, makeCompanyBasedQuery, makePredomFilter, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express, { Request, Response } from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { itemLean, itemMain } from '../models/item.model';
import { itemDecoyMain } from '../models/itemdecoy.model';
import { itemOfferMain } from '../models/itemoffer.model';
import { reviewLean } from '../models/review.model';
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

/**
 * Adds a review for an item
 * @function
 * @async
 * @param {Request} req - The express request object
 * @param {Icustomrequest} req.user - The custom request object with user data
 * @param {string} req.body.review.itemId - The id of the item being reviewed
 * @param {number} req.body.review.rating - The rating given to the item in the review
 * @param {Response} res - The express response object
 * @returns {Promise<Response>} - The express response object with a success status and saved item data
 */
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

/**
 * Removes a review for an item
 * @function
 * @async
 * @param {Request} req - The express request object
 * @param {Icustomrequest} req.user - The custom request object with user data
 * @param {string} req.params.itemId - The id of the item being reviewed
 * @param {string} req.params.rating - The rating given to the item in the review
 * @param {Response} res - The express response object
 * @returns {Promise<Response>} - The express response object with a success status
 */
export const removeReview = async(req: Request, res: Response): Promise<Response> => {
  const { userId } = (req as Icustomrequest).user;
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

/**
 * Creates a new item
 * @function
 * @async
 * @param {Request} req - The express request object
 * @param {Icustomrequest} req.user - The custom request object with user data
 * @param {Object} req.body.item - The item data to create
 * @param {Response} res - The express response object
 * @returns {Promise<Response>} - The express response object with a success status and saved item data
 */
itemRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('item'), roleAuthorisation('items', 'create'), async(req, res, next): Promise<Response> => {
  const item = req.body.item;
  const { filter } = makeCompanyBasedQuery(req);

  item.companyId = filter.companyId;

  const count = await itemMain
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

  item.urId = makeUrId(Number(count[0]?.urId || '0'));
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

  return next();
}, requireUpdateSubscriptionRecord('item'));

/**
 * Creates a new item
 * @function
 * @async
 * @param {Request} req - The express request object
 * @param {Icustomrequest} req.user - The custom request object with user data
 * @param {Object} req.body.item - The item data to create
 * @param {Response} res - The express response object
 * @returns {Promise<Response>} - The express response object with a success status and saved item data
 */
itemRoutes.post('/createimg/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('item'), roleAuthorisation('items', 'create'), uploadFiles, appendBody, saveMetaToDb, async(req, res, next): Promise<Response> => {
  const item = req.body.item;
  const { filter } = makeCompanyBasedQuery(req);

  item.companyId = filter.companyId;
  item.ecomerceCompat = true;

  const count = await itemMain
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

  item.urId = makeUrId(Number(count[0]?.urId || '0'));
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

  return next();
}, requireUpdateSubscriptionRecord('item'));

/**
 * Updates an existing item
 * @function
 * @async
 * @param {Request} req - The express request object
 * @param {Icustomrequest} req.user - The custom request object with user data
 * @param {Object} req.body.item - The item data to update
 * @param {Response} res - The express response object
 * @returns {Promise<Response>} - The express response object with a success status
 */
itemRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'update'), async(req, res): Promise<Response> => {
  const updatedProduct = req.body.item;
  const { filter } = makeCompanyBasedQuery(req);

  updatedProduct.companyId = filter.companyId;
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
    const count = makeRandomString(3, 'numbers');

    item.urId = makeUrId(Number(count));
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
});

itemRoutes.post('/updateimg/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'update'), uploadFiles, appendBody, saveMetaToDb, async(req, res) => {
  const updatedProduct = req.body.item;
  const { filter } = makeCompanyBasedQuery(req);
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
    const count = makeRandomString(3, 'numbers');

    item.urId = makeUrId(Number(count));
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
});

itemRoutes.put('/like/:itemId/:companyIdParam', requireAuth, async(req, res) => {
  const { filter } = makeCompanyBasedQuery(req);
  const { userId } = (req as unknown as Icustomrequest).user;
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

itemRoutes.put('/unlike/:itemId/:companyIdParam', requireAuth, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const { userId } = (req as unknown as Icustomrequest).user;
  const { itemId } = req.params;
  const isValid = verifyObjectIds([itemId, queryId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const item = await itemMain
    .findOneAndUpdate({ _id: itemId, companyId: queryId });

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

itemRoutes.get('/getone/:urId/:companyIdParam', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, urId } = req.params;
  let filter = { urId } as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { urId, companyId: companyIdParam };
  }

  const item = await itemLean
    .findOne({ ...filter })
    .populate([populatePhotos(true), populateCompany()])
    .lean();

  if (!item || !item.companyId) {
    return res.status(200).send({});
  }

  addParentToLocals(res, item._id, itemMain.collection.collectionName, 'trackDataView');

  return res.status(200).send(item);
});

itemRoutes.get('/filtergeneral/:prop/:val/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, prop, val, ecomerceCompat } = req.params;
  let filter = { [prop]: { $regex: val, $options: 'i' } } as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam, [prop]: { $regex: val, $options: 'i' } } ;
  }
  if (prop === 'time') {
    filter = { companyId: companyIdParam, createdAt: { $gte: new Date(val) } } ;
  }
  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }
  const all = await Promise.all([
    itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
  ]);
  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  return res.status(200).send(response);
});

itemRoutes.get('/filterrandom/:prop/:val/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, prop, val, ecomerceCompat } = req.params;
  let filter = { [prop]: { $regex: val, $options: 'i' } } as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam, [prop]: { $regex: val, $options: 'i' } } ;
  }
  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }
  const all = await Promise.all([
    itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .populate([populatePhotos(true), populateCompany()])
      .sort({ timesViewed: 1, likesCount: 1, reviewCount: 1 })
      .lean(),
    itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
  ]);

  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  return res.status(200).send(response);
});

itemRoutes.get('/getall/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = {} as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    // filter = { companyId: companyIdParam }; //TODO
  }
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
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

itemRoutes.get('/getbestsellers/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = {} as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam };
  }
  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const all = await Promise.all([
    itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .skip(offset)
      .limit(limit)
      .sort({ soldCount: 1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
  ]);

  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});


itemRoutes.get('/gettodaysuggestions/:userId/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { userId, limit } = req.params;
  const stnCookie = req.signedCookies['settings'];
  const { ids, newOffset, newLimit } = await todaysRecomendation(limit, stnCookie?.userCookieId, userId);
  let filter = { ecomerceCompat: true } as object;

  if (ids && ids.length > 0) {
    filter = { ...filter, _id: { $in: ids } };
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
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

itemRoutes.get('/gettrending/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = {} as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam };
  }
  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }
  const all = await Promise.all([
    itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .sort({ timesViewed: 1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
  ]);
  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});


itemRoutes.get('/getbehaviourdecoy/:userId/offset/limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { userId } = req.params;
  const stnCookie = req.signedCookies['settings'];
  const { ids } = await getDecoyFromBehaviour(stnCookie?.userCookieId, userId);
  const all = await Promise.all([
    itemLean
      .find({ _id: { $in: ids }, ...makePredomFilter(req) })
      .sort({ timesViewed: 1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ _id: { $in: ids }, ...makePredomFilter(req) })
  ]);
  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

itemRoutes.get('/getfeatured/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = {} as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam };
  }
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
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

// newly posted
itemRoutes.get('/getnew/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = {} as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam };
  }
  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }
  const all = await Promise.all([
    itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .sort({ createdAt: -1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
  ]);
  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

// new not used
itemRoutes.get('/getbrandnew/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = { state: 'new' } as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam, state: 'new' };
  }
  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }
  const all = await Promise.all([
    itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .sort({ createdAt: -1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
  ]);
  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

// new not used
itemRoutes.get('/getused/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = { state: 'refurbished' } as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam, state: 'refurbished' };
  }
  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }
  const all = await Promise.all([
    itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .sort({ createdAt: -1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
  ]);
  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

// filterprice
itemRoutes.get('/filterprice/max/:priceFilterValue/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = {} as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam };
  }
  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }
  const { priceFilterValue } = req.params;
  const all = await Promise.all([
    itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .gte('costMeta.sellingPrice', Number(priceFilterValue))
      .sort({ createdAt: -1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
  ]);
  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

itemRoutes.get('/filterprice/min/:priceFilterValue/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = {} as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam };
  }
  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }
  const { priceFilterValue } = req.params;
  const all = await Promise.all([
    itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .lte('costMeta.sellingPrice', Number(priceFilterValue))
      .sort({ createdAt: -1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
  ]);
  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});


itemRoutes.get('/filterprice/eq/:priceFilterMinValue/:priceFilterMaxValue/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = {} as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam };
  }
  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }
  const { priceFilterMinValue, priceFilterMaxValue } = req.params;
  const all = await Promise.all([
    itemLean
      .find({ ...filter, ...makePredomFilter(req) })
      .gte('costMeta.sellingPrice', Number(priceFilterMaxValue))
      .lte('costMeta.sellingPrice', Number(priceFilterMinValue))
      .sort({ createdAt: -1 })
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ ...filter, ...makePredomFilter(req) })
  ]);
  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

itemRoutes.get('/filterstars/:starVal/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = {} as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam };
  }
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
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

itemRoutes.get('/discount/:discountValue/:offset/:limit/:companyIdParam/:ecomerceCompat', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam, ecomerceCompat } = req.params;
  let filter = {} as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam };
  }
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
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  for (const val of newItems) {
    addParentToLocals(res, val._id, itemMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

itemRoutes.post('/getsponsored/:companyIdParam', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyIdParam } = req.params;
  const ids = req.body.sponsored;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let filter = { _id: { $in: ids } } as object;
  const isValid = verifyObjectId(companyIdParam);

  if (isValid) {
    filter = { companyId: companyIdParam, _id: { $in: ids } };
  }
  if (ids && ids.length > 0) {
    for (const id of ids) {
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
});

itemRoutes.get('/getoffered/:companyIdParam', appendUserToReqIfTokenExist, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  let filter = {} as object;
  const isValid = verifyObjectId(queryId);

  if (isValid) {
    filter = { companyId: queryId };
  }
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
});

itemRoutes.put('/addsponsored/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'update'), async(req, res) => {
  const { id } = req.params;
  const { sponsored } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  const item = await itemMain.findByIdAndUpdate(id);

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
});

itemRoutes.put('/updatesponsored/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'update'), async(req, res) => {
  const { id } = req.params;
  const { sponsored } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const item = await itemMain.findOneAndUpdate({ _id: id, ...filter });

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
});

itemRoutes.delete('/deletesponsored/:id/:spnsdId/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'update'), async(req, res) => {
  const { id, spnsdId } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const item = await itemMain.findOneAndUpdate({ _id: id, ...filter });

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
});

itemRoutes.put('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'delete'), async(req, res) => {
  const { id } = req.params;
  const { filter } = makeCompanyBasedQuery(req);

  // start by removing offers
  await itemOfferMain.deleteMany({ ...filter, items: { $elemMatch: { $in: [id] } } });
  // also remove decoys
  await itemDecoyMain.deleteMany({ ...filter, items: { $elemMatch: { $in: [id] } } });
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const found = await itemMain.findOne({ _id: id, ...filter })
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // const deleted = await itemMain.findOneAndDelete({ _id: id, ...filter });
  const deleted = await itemMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    addParentToLocals(res, id, itemMain.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

itemRoutes.put('/deletefiles/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'delete'), deleteFiles(true), async(req, res) => {
  const filesWithDir: IfileMeta[] = req.body.filesWithDir;
  const { filter } = makeCompanyBasedQuery(req);

  if (filesWithDir && !filesWithDir.length) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const updatedProduct = req.body.item;
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
});

itemRoutes.post('/search/:offset/:limit/:companyIdParam;userId', async(req, res) => {
  const { searchterm, searchKey, category, extraFilers, subCategory, ecomerceCompat } = req.body;
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const stnCookie = req.signedCookies['settings'];

  registerSearchParams(searchterm, '', stnCookie?.userCookieId, req.params.userId);
  const { companyIdParam } = req.params;

  if (companyIdParam !== 'undefined') {
    itemRoutesLogger.info('filter item with 999999 def');
    const isValid = verifyObjectId(companyIdParam);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
  }
  itemRoutesLogger.info('filter item with 11111');
  let filter;

  if (!category || category === 'all') {
    if (subCategory) {
      filter = { subCategory };
    } else {
      filter = {};
    }
  } else if (subCategory) {
    filter = { category, subCategory };
  } else {
    filter = { category };
  }

  if (ecomerceCompat === 'true') {
    filter = { ...filter, ecomerceCompat: true };
  }

  if (companyIdParam !== 'undefined') {
    filter = { ...filter, companyId: companyIdParam };
  }

  itemRoutesLogger.info('filter item with 22222');

  if (extraFilers) {
    switch (extraFilers.filter) {
      case 'price':
        if (extraFilers.val.min && extraFilers.val.max) {
          filter = {
            ...filter,
            ...{
              $gte: extraFilers.val.min,
              $lte: extraFilers.val.max
            }
          };
        } else if (extraFilers.val.min) {
          filter = {
            ...filter,
            ...{ $gte: extraFilers.val.min }
          };
        } else if (extraFilers.val.max) {
          filter = {
            ...filter,
            ...{ $lte: extraFilers.val.min }
          };
        }

        break;
      case 'state':
        filter = {
          ...filter,
          ...{ state: extraFilers.val.val }
        };
        break;
      case 'category':
        filter = {
          ...filter,
          ...{ category: extraFilers.val.val }
        };
        break;
      case 'subCategory':
        break;
      case 'breand':
        filter = {
          ...filter,
          ...{ brand: extraFilers.val.val }
        };
        break;

      /* default:
        return res.status(401).send({ success: false, err: 'unauthorised' }); */
    }
  }

  /* TODO proper regex
  const searchFields = ['name', 'description', 'category', 'subCategory', 'brand'];
  const searchRegex = { $regex: searchterm, $options: 'i' };
  const searchQuery = searchFields.reduce((acc, field) => {
    acc[field] = searchRegex;
    return acc;
  }, {}); */

  const all = await Promise.all([
    itemLean
      .find({ [searchKey]: { $regex: searchterm, $options: 'i' }, ...filter, ...makePredomFilter(req) })
      .skip(offset)
      .limit(limit)
      .populate([populatePhotos(true), populateCompany()])
      .lean(),
    itemLean.countDocuments({ [searchKey]: { $regex: searchterm, $options: 'i' }, ...filter, ...makePredomFilter(req) })
  ]);

  const newItems = all[0].filter(item => item.companyId);
  const response: IdataArrayResponse = {
    count: all[1],
    data: newItems
  };

  return res.status(200).send(response);
});

itemRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'delete'), async(req, res) => {
  const { ids } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  // start by removing offers
  /* await itemOfferMain.deleteMany({ companyId: queryId, items: { $elemMatch: { $in: ids } } }); */
  // TODO tarack ehe
  await itemOfferMain.updateOne({ ...filter, items: { $elemMatch: { $in: ids } } }, {
    $set: { isDeleted: true }
  });
  // also remove decoys
  /* await itemDecoyMain.deleteMany({ companyId: queryId, items: { $elemMatch: { $in: ids } } }); */
  // TODO TARC
  await itemDecoyMain.updateOne({ ...filter, items: { $elemMatch: { $in: ids } } }, {
    $set: { isDeleted: true }
  });

  let filesWithDir: IfileMeta[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const alltoDelete = await itemLean.find({ _id: { $in: ids } })
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
    .deleteMany({ _id: { $in: ids } })
    .catch(err => {
      itemRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */


  const deleted = await itemMain
    .updateMany({ _id: { $in: ids } }, {
      $set: { isDeleted: true }
    })
    .catch(err => {
      itemRoutesLogger.error('deletemany - err: ', err);

      return null;
    });

  if (Boolean(deleted)) {
    for (const val of ids) {
      addParentToLocals(res, val, itemMain.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});

