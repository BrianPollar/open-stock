/* eslint-disable @typescript-eslint/no-misused-promises */
import { Icustomrequest, IdataArrayResponse } from '@open-stock/stock-universal';
import {
  makeCompanyBasedQuery, offsetLimitRelegator,
  requireAuth, verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { userWalletLean, userWalletMain } from '../../models/printables/wallet/user-wallet.model';
import { populateUser } from '../../utils/query';
import { populateTrackEdit, populateTrackView } from '@open-stock/stock-auth-server';

const walletRoutesLogger = tracer.colorConsole({
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
 * Router for wallet related routes.
 */
export const walletRoutes = express.Router();

walletRoutes.post('/create/:companyIdParam', requireAuth);

walletRoutes.post('/createimg/:companyIdParam', requireAuth);

walletRoutes.post('/getone', requireAuth, async(req, res) => {
  const { id, userId } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  let filter2 = {};

  if (id) {
    const isValid = verifyObjectIds([id]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    filter2 = { ...filter2, _id: id };
  }

  /* if (queryId) {
    filter = { ...filter, ...filter };
  } */
  if (userId) {
    const isValid = verifyObjectIds([userId]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    filter2 = { ...filter2, user: userId };
  }

  if (req.body.profileOnly === 'true') {
    const { userId } = (req as Icustomrequest).user;

    filter2 = { user: userId };
  }
  const wallet = await userWalletLean
    .findOne({ ...filter, ...filter2 })
    .populate([populateUser(), populateTrackEdit(), populateTrackView()])
    .lean();

  return res.status(200).send(wallet);
});

walletRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { filter } = makeCompanyBasedQuery(req);
  const all = await Promise.all([
    userWalletLean
      .find({ ...filter })
      .populate([populateUser(), populateTrackEdit(), populateTrackView()])
      .skip(offset)
      .limit(limit)
      .lean(),
    userWalletLean.countDocuments({ ...filter })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  return res.status(200).send(response);
});

walletRoutes.get('/getbyrole/:offset/:limit/:role/:companyIdParam', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { filter } = makeCompanyBasedQuery(req);
  const all = await Promise.all([
    userWalletLean
      .find({ ...filter })
      .populate([populateUser(), populateTrackEdit(), populateTrackView()])
      .skip(offset)
      .limit(limit)
      .lean(),
    userWalletLean.countDocuments({ ...filter })
  ]);
  const walletsToReturn = all[0].filter(val => val.user);
  const response: IdataArrayResponse = {
    count: all[1],
    data: walletsToReturn
  };

  return res.status(200).send(response);
});

walletRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { searchterm, searchKey, extraDetails } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  let filters;

  switch (searchKey as string) {
    case 'startDate':
    case 'endDate':
    case 'occupation':
    case 'employmentType':
    case 'salary':
      filters = { [searchKey]: { $regex: searchterm, $options: 'i' } };
      break;
    default:
      filters = {};
      break;
  }
  let matchFilter;

  if (!extraDetails) {
    matchFilter = {};
  }
  const all = await Promise.all([
    userWalletLean
      .find({ ...filter, ...filters })
      .populate([populateUser(), populateTrackEdit(), populateTrackView()])
      .skip(offset)
      .limit(limit)
      .lean(),
    userWalletLean.countDocuments({ ...filter, ...filters })
  ]);
  const walletsToReturn = all[0].filter(val => val.user);
  const response: IdataArrayResponse = {
    count: all[1],
    data: walletsToReturn
  };

  return res.status(200).send(response);
});

walletRoutes.put('/update/:companyIdParam', requireAuth);

walletRoutes.post('/updateimg/:companyIdParam', requireAuth);

walletRoutes.put('/deleteone/:companyIdParam', requireAuth, async(req, res) => {
  const { id } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // const deleted = await userWalletMain.findOneAndDelete({ _id: id, ...filter });
  const deleted = await userWalletMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

walletRoutes.put('/deletemany/:companyIdParam', requireAuth, async(req, res) => {
  const { ids } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  /* const deleted = await userWalletMain
    .deleteMany({ _id: { $in: ids }, ...filter })
    .catch(err => {
      walletRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

  const deleted = await userWalletMain
    .updateMany({ _id: { $in: ids }, ...filter }, {
      $set: { isDeleted: true }
    })
    .catch(err => {
      walletRoutesLogger.error('deletemany - err: ', err);

      return null;
    });

  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});


