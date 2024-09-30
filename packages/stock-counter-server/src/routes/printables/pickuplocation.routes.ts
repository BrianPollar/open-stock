import { requireActiveCompany } from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IfilterAggResponse, IfilterProps, IpickupLocation, Isuccess
} from '@open-stock/stock-universal';
import {
  addParentToLocals,
  lookupLimit,
  lookupOffset,
  lookupSort,
  lookupTrackEdit,
  lookupTrackView,
  makeCompanyBasedQuery,
  offsetLimitRelegator, requireAuth,
  roleAuthorisation,
  stringifyMongooseErr
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { TpickupLocation, pickupLocationLean, pickupLocationMain } from '../../models/printables/pickuplocation.model';

/**
 * Logger for pickup location routes
 */
const pickupLocationRoutesLogger = tracer.colorConsole({
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
 * Express router for pickup location routes
 */
export const pickupLocationRoutes = express.Router();

pickupLocationRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'create'),
  async(req: IcustomRequest<never, IpickupLocation>, res) => {
    const pickupLocation = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    pickupLocation.companyId = filter.companyId;
    const newPickupLocation = new pickupLocationMain(pickupLocation);
    let errResponse: Isuccess;
    const saved = await newPickupLocation.save()
      .catch(err => {
        pickupLocationRoutesLogger.error('create - err: ', err);
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
      addParentToLocals(res, saved._id, pickupLocationMain.collection.collectionName, 'makeTrackEdit');
    }


    return res.status(200).send({ success: Boolean(saved) });
  }
);

pickupLocationRoutes.put(
  '/update',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'update'),
  async(req: IcustomRequest<never, IpickupLocation>, res) => {
    const updatedPickupLocation = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    updatedPickupLocation.companyId = filter.companyId;

    const pickupLocation = await pickupLocationMain
      .findOne({ _id: updatedPickupLocation._id, ...filter })
      .lean();

    if (!pickupLocation) {
      return res.status(404).send({ success: false });
    }

    let errResponse: Isuccess;
    const updated = await pickupLocationMain.updateOne({
      _id: updatedPickupLocation._id, ...filter
    }, {
      $set: {
        name: updatedPickupLocation.name || pickupLocation.name,
        contact: updatedPickupLocation.contact || pickupLocation.contact,
        isDeleted: updatedPickupLocation.isDeleted || pickupLocation.isDeleted
      }
    })
      .catch(err => {
        pickupLocationRoutesLogger.error('update - err: ', err);
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

    addParentToLocals(res, pickupLocation._id, pickupLocationMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: Boolean(updated) });
  }
);

pickupLocationRoutes.get(
  '/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'read'),
  async(req: IcustomRequest<{ _id: string }, null>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const pickupLocation = await pickupLocationLean
      .findOne({ _id, ...filter })
      .lean();

    if (!pickupLocation) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, pickupLocation._id, pickupLocationMain.collection.collectionName, 'trackDataView');

    return res.status(200).send(pickupLocation);
  }
);

pickupLocationRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      pickupLocationLean
        .find({ ...filter })
        .skip(offset)
        .limit(limit)
        .lean(),
      pickupLocationLean.countDocuments({ ...filter })
    ]);
    const response: IdataArrayResponse<TpickupLocation> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, pickupLocationMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

pickupLocationRoutes.delete(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);

    // const deleted = await pickupLocationMain.findOneAndDelete({ _id, ...filter });
    const deleted = await pickupLocationMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, pickupLocationMain.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);

pickupLocationRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = pickupLocationLean.aggregate<IfilterAggResponse<TpickupLocation>>([
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
    const dataArr: IfilterAggResponse<TpickupLocation>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const response: IdataArrayResponse<TpickupLocation> = {
      count,
      data: all
    };

    for (const val of all) {
      addParentToLocals(res, val._id, pickupLocationMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

pickupLocationRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    /* const deleted = await pickupLocationMain
    .deleteMany({ _id: { $in: _ids }, ...filter })
    .catch(err => {
      pickupLocationRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

    const deleted = await pickupLocationMain
      .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        pickupLocationRoutesLogger.error('deletemany - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      for (const val of _ids) {
        addParentToLocals(res, val, pickupLocationMain.collection.collectionName, 'trackDataDelete');
      }

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
  }
);
