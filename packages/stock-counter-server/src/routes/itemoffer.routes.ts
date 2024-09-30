
import {
  populateTrackEdit, populateTrackView,
  requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord
} from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IfilterAggResponse, IfilterProps, IitemOffer, Isuccess
} from '@open-stock/stock-universal';
import {
  addParentToLocals, appendUserToReqIfTokenExist,
  constructFiltersFromBody,
  generateUrId,
  lookupSubFieldItemsRelatedFilter,
  makeCompanyBasedQuery, makePredomFilter, offsetLimitRelegator,
  requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { TitemOffer, itemOfferLean, itemOfferMain } from '../models/itemoffer.model';
import { populateItems } from '../utils/query';

/** Logger for item offer routes */
const itemOfferRoutesLogger = tracer.colorConsole({
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
 * Router for item offers.
 */
export const itemOfferRoutes = express.Router();

itemOfferRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  requireCanUseFeature('offer'),
  roleAuthorisation('offers', 'create'),
  async(req: IcustomRequest<never, { itemoffer: IitemOffer }>, res, next) => {
    const { itemoffer } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    itemoffer.companyId = filter.companyId;

    itemoffer.urId = await generateUrId(itemOfferMain);
    const newDecoy = new itemOfferMain(itemoffer);
    let errResponse: Isuccess;
    const saved = await newDecoy.save()
      .catch(err => {
        itemOfferRoutesLogger.error('create - err: ', err);
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
      addParentToLocals(res, saved._id, itemOfferMain.collection.collectionName, 'makeTrackEdit');
    }

    if (Boolean(saved)) {
      return res.status(403).send('unknown error');
    }

    return next();
  },
  requireUpdateSubscriptionRecord('offer')
);

itemOfferRoutes.get(
  '/all/:type/:offset/:limit',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ offset: string; limit: string; type: string }, null>, res) => {
    const { type } = req.params;

    const query = {} as object;

    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    let filter: object;

    if (type !== 'all') {
      filter = { type, ...query };
    }
    const all = await Promise.all([
      itemOfferLean
        .find({ ...filter, ...makePredomFilter(req) })
        .skip(offset)
        .limit(limit)
        .populate([populateItems(), populateTrackEdit(), populateTrackView()])
        .lean(),
      itemOfferLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const response: IdataArrayResponse<TitemOffer> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, itemOfferMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

itemOfferRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('offers', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const aggCursor = itemOfferLean
      .aggregate<IfilterAggResponse<TitemOffer>>([
        ...lookupSubFieldItemsRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
      ]);
    const dataArr: IfilterAggResponse<TitemOffer>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const response: IdataArrayResponse<TitemOffer> = {
      count,
      data: all
    };

    for (const val of all) {
      addParentToLocals(res, val._id, itemOfferMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

itemOfferRoutes.get(
  '/one/:_id',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ _id: string }, null>, res) => {
    const { _id } = req.params;

    const _ids = [_id];

    const isValid = verifyObjectIds(_ids);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const offer = await itemOfferLean
      .findOne({ _id, ...makePredomFilter(req) })
      .populate([populateItems(), populateTrackEdit(), populateTrackView()])
      .lean();

    if (!offer) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, offer._id, itemOfferMain.collection.collectionName, 'trackDataView');

    return res.status(200).send(offer);
  }
);

itemOfferRoutes.delete(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('offers', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    // const deleted = await itemOfferMain.findOneAndDelete({ _id, });
    const deleted = await itemOfferMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, itemOfferMain.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

itemOfferRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('offers', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    /* const deleted = await itemOfferMain
    .deleteMany({ _id: { $in: _ids }, })
    .catch(err => {
      itemOfferRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

    const deleted = await itemOfferMain
      .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        itemOfferRoutesLogger.error('deletemany - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      for (const val of _ids) {
        addParentToLocals(res, val, itemOfferMain.collection.collectionName, 'trackDataDelete');
      }

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
  }
);
