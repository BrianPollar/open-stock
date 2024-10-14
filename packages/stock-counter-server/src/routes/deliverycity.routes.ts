
import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { IcustomRequest, IdataArrayResponse, IdeleteMany } from '@open-stock/stock-universal';
import {
  addParentToLocals, appendUserToReqIfTokenExist,
  handleMongooseErr,
  makePredomFilter, offsetLimitRelegator, requireAuth,
  roleAuthorisation, verifyObjectId, verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { Tdeliverycity, deliverycityLean, deliverycityMain } from '../models/deliverycity.model';

/**
 * Express router for deliverycity routes
 */
export const deliverycityRoutes = express.Router();

deliverycityRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'create'),
  async(req: IcustomRequest<never, { deliverycity }>, res) => {
    const deliverycity = req.body.deliverycity;
    const newDeliverycity = new deliverycityMain(deliverycity);

    const savedRes = await newDeliverycity.save()
      .catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, savedRes._id, deliverycityMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);

deliverycityRoutes.get(
  '/one/:urIdOr_id',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ urIdOr_id: string }, null>, res) => {
    const { urIdOr_id } = req.params;
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    const deliverycity = await deliverycityLean
      .findOne({ ...filterwithId })
      .lean();

    if (!deliverycity) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, deliverycity._id, deliverycityMain.collection.collectionName, 'trackDataView');

    return res.status(200).send(deliverycity);
  }
);

deliverycityRoutes.get(
  '/all/:offset/:limit',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
      deliverycityLean
        .find({ isDeleted: false })
        .skip(offset)
        .limit(limit)
        .lean(),
      deliverycityLean.countDocuments({ })
    ]);
    const response: IdataArrayResponse<Tdeliverycity> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, deliverycityMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

deliverycityRoutes.put(
  '/update',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'update'),
  async(req: IcustomRequest<never, any>, res) => {
    const updatedCity = req.body;
    const isValid = verifyObjectIds([updatedCity._id]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deliverycity = await deliverycityMain
      .findOne({ _id: updatedCity._id, ...makePredomFilter(req) })
      .lean();

    if (!deliverycity) {
      return res.status(404).send({ success: false });
    }


    const updateRes = await deliverycityMain.updateOne({
      _id: updatedCity._id
    }, {
      $set: {
        name: updatedCity.name || deliverycity.name,
        shippingCost: updatedCity.shippingCost || deliverycity.shippingCost,
        currency: updatedCity.currency || deliverycity.currency,
        deliversInDays: updatedCity.deliversInDays || deliverycity.deliversInDays,
        isDeleted: updatedCity.isDeleted || deliverycity.isDeleted
      }
    })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, updatedCity._id, deliverycityMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: true });
  }
);

deliverycityRoutes.delete(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const isValid = verifyObjectIds([_id]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }

    // const deleted = await deliverycityMain.findOneAndDelete({ _id });
    const updateRes = await deliverycityMain
      .updateOne({ _id, ...makePredomFilter(req) }, { $set: { isDeleted: true } })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, deliverycityMain.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: true });
  }
);

deliverycityRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('deliveryCitys', 'delete'),
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const isValid = verifyObjectIds([..._ids]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }

    const updateRes = await deliverycityMain
      .updateMany({ _id: { $in: _ids } }, {
        $set: { isDeleted: true }
      }).catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    for (const val of _ids) {
      addParentToLocals(res, val, deliverycityMain.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);
