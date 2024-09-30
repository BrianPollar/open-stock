/**
 * This file contains the authentication routes for the stock-auth-server package.
 * It exports the companyRoutes router and companyLoginRelegator function.
 * It also imports various controllers and models from the same package and other packages.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-var-requires */
import { createNotifStn } from '@open-stock/stock-notif-server';
import {
  Iauthresponse, IcustomRequest,
  IdataArrayResponse, IdeleteMany, IdeleteOne, IeditCompany,
  IfilterAggResponse, IfilterProps, Isuccess
} from '@open-stock/stock-universal';
import {
  addParentToLocals,
  appendBody,
  constructFiltersFromBody, generateUrId,
  lookupSubFieldUserFilter, makeCompanyBasedQuery,
  offsetLimitRelegator,
  requireAuth,
  roleAuthorisation,
  saveMetaToDb,
  stringifyMongooseErr, uploadFiles
} from '@open-stock/stock-universal-server';
import express, { Response } from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { Tcompany, companyLean, companyMain } from '../models/company.model';
import { user } from '../models/user.model';
import { populateOwner, populateTrackEdit, populateTrackView } from '../utils/query';
import { requireActiveCompany } from './company-auth';
import { requireSuperAdmin } from './superadmin.routes';
import {
  addUser, determineUserToRemove,
  determineUsersToRemove, removeManyUsers,
  removeOneUser, updateUserBulk
} from './user.routes';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
// const passport = require('passport');

/**
 * Router for company authentication routes.
 */
export const companyRoutes = express.Router();

export const addCompany = async(
  req: IcustomRequest<never, IeditCompany>,
  res: Response
) => {
  companyAuthLogger.info('Add company');
  const savedUser = req.body.user;
  const companyData = req.body.company;

  companyData.owner = savedUser._id;

  companyData.urId = await generateUrId(companyMain);
  const newCompany = new companyMain(companyData);
  let status = 200;
  let response: Iauthresponse = { success: true };
  const savedCompany = await newCompany.save().catch((err) => {
    status = 403;
    const errResponse: Isuccess = {
      success: false
    };

    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }
    response = errResponse;

    return err;
  });

  if (savedCompany && savedCompany._id) {
    addParentToLocals(res, savedCompany._id, companyMain.collection.collectionName, 'makeTrackEdit');
  }

  if (!response.err && savedCompany) {
    const stn = {
      companyId: savedCompany._id,
      invoices: true,
      payments: true,
      orders: true,
      jobCards: true,
      users: true
    };

    await createNotifStn(stn);
    response = {
      success: true,
      _id: savedCompany._id
    };
  } else {
    await user.deleteOne({ _id: savedUser._id });
  }

  return res.status(status).send(response);
};

export const updateCompany = async(
  req: IcustomRequest<never, IeditCompany>,
  res: Response
) => {
  companyAuthLogger.info('Update company');
  const updatedCompany = req.body.company;

  const foundCompany = await companyMain
    .findOne({ _id: updatedCompany._id });

  if (!foundCompany) {
    return res.status(404).send({ success: false });
  }

  if (!foundCompany.urId) {
    foundCompany.urId = await generateUrId(companyMain);
  }

  delete updatedCompany._id;

  const keys = Object.keys(updatedCompany);

  keys.forEach(key => {
    if (key !== '_id' && key !== 'phone' && key !== 'email') {
      foundCompany[key] = updatedCompany[key] || foundCompany[key];
    }
  });

  const status = 200;
  let response: Iauthresponse = { success: true };

  await foundCompany.save().catch((err) => {
    const errResponse: Isuccess = {
      success: false
    };

    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }
    response = errResponse;
  });

  return res.status(status).send(response);
};

/**
 * Logger for company authentication routes.
 */
const companyAuthLogger = tracer.colorConsole({
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
    fs.appendFile(logDir + '/auth-server.log', data.rawoutput + '\n', err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('raw.output err ', err);
      }
    });
  }
});

companyRoutes.post('/add', requireAuth, requireSuperAdmin, addUser, addCompany);

companyRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireSuperAdmin,
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;

    const all = await Promise.all([
      companyLean
        .find({ })
        .sort({ createdAt: 1 })
        .limit(Number(currLimit))
        .skip(Number(currOffset))
        .populate([populateOwner(), populateTrackEdit(), populateTrackView()])
        .lean(),
      companyLean.countDocuments()
    ]);
    const filteredCompanys = all[0].filter(data => !data.blocked);
    const response: IdataArrayResponse<Tcompany> = {
      count: all[1],
      data: filteredCompanys
    };

    for (const val of filteredCompanys) {
      addParentToLocals(res, val._id, companyMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

companyRoutes.get(
  '/one/:_id',
  requireAuth,
  requireSuperAdmin,
  async(req: IcustomRequest<{ _id: string }, null>, res) => {
    const found = await companyLean
      .findOne({ _id: req.params._id })
      .populate([populateOwner(), populateTrackEdit(), populateTrackView()])
      .lean();

    if (!found) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, found._id, companyMain.collection.collectionName, 'trackDataView');

    return res.status(200).send(found);
  }
);

companyRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const aggCursor = companyLean
      .aggregate<IfilterAggResponse<Tcompany>>([
        ...lookupSubFieldUserFilter(constructFiltersFromBody(req), propSort, offset, limit)
      ]);
    const dataArr: IfilterAggResponse<Tcompany>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const response: IdataArrayResponse<Tcompany> = {
      count,
      data: all
    };

    for (const val of all) {
      addParentToLocals(res, val._id, companyMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

companyRoutes.put(
  '/update',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'update'),
  updateUserBulk,
  updateCompany
);

companyRoutes.post(
  '/update/img',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'update'),
  uploadFiles,
  appendBody,
  saveMetaToDb,
  updateUserBulk,
  updateCompany
);

companyRoutes.put(
  '/delete/one',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'delete'),
  determineUserToRemove(companyLean, []),
  removeOneUser,
  async(req: IcustomRequest<never, IdeleteOne>, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const deleted = await companyMain
      .updateOne({ _id, ...filter }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        companyAuthLogger.error('deletemany - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, companyMain.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({
        success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
  }
);

companyRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('staffs', 'delete'),
  determineUsersToRemove(companyLean, []),
  removeManyUsers,
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const deleted = await companyMain
      .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        companyAuthLogger.error('deletemany - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      for (const val of _ids) {
        addParentToLocals(res, val, companyMain.collection.collectionName, 'trackDataDelete');
      }

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
  }
);
