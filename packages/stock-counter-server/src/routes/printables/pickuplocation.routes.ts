import { requireActiveCompany } from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IfilterAggResponse, IfilterProps, IpickupLocation
} from '@open-stock/stock-universal';
import {
  addParentToLocals, handleMongooseErr,
  lookupFacet,
  lookupTrackEdit,
  lookupTrackView,
  makeCompanyBasedQuery,
  offsetLimitRelegator, requireAuth,
  roleAuthorisation
} from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { TpickupLocation, pickupLocationLean, pickupLocationMain } from '../../models/printables/pickuplocation.model';

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

    const savedRes = await newPickupLocation.save()
      .catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, savedRes._id, pickupLocationMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
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


    const updateRes = await pickupLocationMain.updateOne({
      _id: updatedPickupLocation._id, ...filter
    }, {
      $set: {
        name: updatedPickupLocation.name || pickupLocation.name,
        contact: updatedPickupLocation.contact || pickupLocation.contact,
        isDeleted: updatedPickupLocation.isDeleted || pickupLocation.isDeleted
      }
    })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, pickupLocation._id, pickupLocationMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
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
    const updateRes = await pickupLocationMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, pickupLocationMain.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: true });
  }
);

pickupLocationRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort, returnEmptyArr } = req.body;
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
      ...lookupFacet(offset, limit, propSort, returnEmptyArr)
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

    const updateRes = await pickupLocationMain
      .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
      })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    for (const val of _ids) {
      addParentToLocals(res, val, pickupLocationMain.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);
