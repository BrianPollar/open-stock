
import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { IcustomRequest, IdataArrayResponse, IdeleteMany, Isuccess } from '@open-stock/stock-universal';
import {
  addParentToLocals, appendUserToReqIfTokenExist,
  makePredomFilter, offsetLimitRelegator, requireAuth,
  roleAuthorisation, stringifyMongooseErr, verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { Tdeliverycity, deliverycityLean, deliverycityMain } from '../models/deliverycity.model';

/**
 * Logger for deliverycity routes
 */
const deliverycityRoutesLogger = tracer.colorConsole({
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
    let errResponse: Isuccess;
    const saved = await newDeliverycity.save()
      .catch(err => {
        deliverycityRoutesLogger.error('create - err: ', err);
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
      addParentToLocals(res, saved._id, deliverycityMain.collection.collectionName, 'makeTrackEdit');
    }

    return res.status(200).send({ success: Boolean(saved) });
  }
);

deliverycityRoutes.get(
  '/one/:_id',
  appendUserToReqIfTokenExist,
  async(req: IcustomRequest<{ _id: string }, null>, res) => {
    const { _id } = req.params;
    const deliverycity = await deliverycityLean
      .findOne({ _id })
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

    let errResponse: Isuccess;
    const updated = await deliverycityMain.updateOne({
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
      .catch(err => {
        deliverycityRoutesLogger.error('update - err: ', err);
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

    addParentToLocals(res, updatedCity._id, deliverycityMain.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: Boolean(updated) });
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
    const deleted = await deliverycityMain
      .updateOne({ _id, ...makePredomFilter(req) }, { $set: { isDeleted: true } });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, deliverycityMain.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
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

    /* const deleted = await deliverycityMain
    .deleteMany({ _id: { $in: _ids } })
    .catch(err => {
      deliverycityRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

    const deleted = await deliverycityMain
      .updateMany({ _id: { $in: _ids } }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        deliverycityRoutesLogger.error('deletemany - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      for (const val of _ids) {
        addParentToLocals(res, val, deliverycityMain.collection.collectionName, 'trackDataDelete');
      }

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
  }
);
