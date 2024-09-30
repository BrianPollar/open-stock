import {
  populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord
} from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IfilterAggResponse, IfilterProps, Iitem, IitemDecoy, Isuccess
} from '@open-stock/stock-universal';
import {
  addParentToLocals, appendUserToReqIfTokenExist, constructFiltersFromBody,
  generateUrId,
  lookupSubFieldItemsRelatedFilter, makeCompanyBasedQuery, makePredomFilter, offsetLimitRelegator, requireAuth,
  roleAuthorisation, stringifyMongooseErr,
  verifyObjectId,
  verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { itemLean } from '../models/item.model';
import { TitemDecoy, itemDecoyLean, itemDecoyMain } from '../models/itemdecoy.model';
import { populateItems } from '../utils/query';

/** Logger for item decoy routes */
const itemDecoyRoutesLogger = tracer.colorConsole({
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
 * Router for item decoy routes.
 */
export const itemDecoyRoutes = express.Router();

itemDecoyRoutes.post(
  '/add/:how',
  requireAuth,
  requireActiveCompany,
  requireCanUseFeature('decoy'),
  roleAuthorisation('decoys', 'create'),
  async(req: IcustomRequest<{ how: string }, { itemdecoy: IitemDecoy }>, res, next) => {
    const { how } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const { itemdecoy } = req.body;

    itemdecoy.companyId = filter.companyId;

    const urId = await generateUrId(itemDecoyMain);

    let decoy;

    if (how === 'automatic') {
    // If creating an automatic decoy, verify the item ID and find the item
      const isValid = verifyObjectId(itemdecoy.items[0] as any); // TODO

      if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
      }

      const found: Iitem = await itemLean.findById(itemdecoy.items[0])
        .lean();

      if (!found) {
        return res.status(404).send({ success: false });
      }

      // Find the items with the minimum and maximum selling prices
      const minItem = await itemLean.find({})
        .lte('costMeta.sellingPrice', Number(found.costMeta.sellingPrice))
        .sort({ createdAt: -1 })
        .limit(1);

      const maxItem = await itemLean.find({})
        .gte('costMeta.sellingPrice', Number(found.costMeta.sellingPrice))
        .sort({ createdAt: 1 })
        .limit(1);

      // Create the decoy object
      decoy = {
        type: how,
        urId,
        items: [
          minItem[0]._id,
          itemdecoy.items[0],
          maxItem[0]._id
        ]
      };
    } else {
    // If creating a manual decoy, simply use the provided item ID
      decoy = {
        urId,
        type: how,
        items: itemdecoy.items[0]
      };
    }

    // Save the new decoy to the database
    const newDecoy = new itemDecoyMain(decoy);
    let errResponse: Isuccess;
    const saved = await newDecoy.save()
      .catch(err => {
        itemDecoyRoutesLogger.error('create - err: ', err);
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
      addParentToLocals(res, saved._id, itemDecoyMain.collection.collectionName, 'makeTrackEdit');
    }

    if (!Boolean(saved)) {
      return res.status(403).send('unknown error');
    }

    return next();
  },
  requireUpdateSubscriptionRecord('decoy')
);

itemDecoyRoutes.get(
  '/all/:offset/:limit',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const filter = {} as object;

    const all = await Promise.all([
      itemDecoyLean
        .find({ ...filter, ...makePredomFilter(req) })
        .skip(offset)
        .limit(limit)
        .populate([populateItems(), populateTrackEdit(), populateTrackView()])
        .lean(),
      itemDecoyLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const response: IdataArrayResponse<TitemDecoy> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, itemDecoyMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

itemDecoyRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('decoys', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const aggCursor = itemDecoyLean
      .aggregate<IfilterAggResponse<TitemDecoy>>([
        ...lookupSubFieldItemsRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
      ]);
    const dataArr: IfilterAggResponse<TitemDecoy>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const response: IdataArrayResponse<TitemDecoy> = {
      count,
      data: all
    };

    for (const val of all) {
      addParentToLocals(res, val._id, itemDecoyMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

itemDecoyRoutes.get(
  '/one/:_id',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ _id: string }, null>, res) => {
    const { _id } = req.params;
    const _ids = [_id];

    const isValid = verifyObjectIds(_ids);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const decoy = await itemDecoyLean
      .findOne({ _id, ...makePredomFilter(req) })
      .populate([populateItems(), populateTrackEdit(), populateTrackView()])
      .lean();

    if (!decoy) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, decoy._id, itemDecoyMain.collection.collectionName, 'trackDataView');

    return res.status(200).send(decoy);
  }
);

itemDecoyRoutes.delete(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('decoys', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);

    // const deleted = await itemDecoyMain.findOneAndDelete({ _id, });
    const deleted = await itemDecoyMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, itemDecoyMain.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

itemDecoyRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('decoys', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    /* const deleted = await itemDecoyMain
    .deleteMany({ _id: { $in: _ids }, })
    .catch(err => {
      itemDecoyRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

    const deleted = await itemDecoyMain
      .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        itemDecoyRoutesLogger.error('deletemany - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      for (const val of _ids) {
        addParentToLocals(res, val, itemDecoyMain.collection.collectionName, 'trackDataDelete');
      }

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
  }
);
