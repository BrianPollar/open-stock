
import { populateTrackEdit, populateTrackView } from '@open-stock/stock-auth-server';
import { IcustomRequest, IdataArrayResponse, IdeleteMany, IfilterProps } from '@open-stock/stock-universal';
import {
  makeCompanyBasedQuery, offsetLimitRelegator,
  requireAuth, verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { TuserWallet, userWalletLean, userWalletMain } from '../../models/printables/wallet/user-wallet.model';
import { populateUser } from '../../utils/query';

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

walletRoutes.post('/add', requireAuth);

walletRoutes.post('/add/img', requireAuth);

walletRoutes.post('/one', requireAuth, async(req: IcustomRequest<never, {_id: string; userId: string}>, res) => {
  const { _id, userId } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  let filter2 = {};

  if (_id) {
    const isValid = verifyObjectIds([_id]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    filter2 = { ...filter2, _id };
  }

  /* if (companyId) {
    filter = { ...filter, ...filter };
  } */
  if (userId) {
    const isValid = verifyObjectIds([userId]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    filter2 = { ...filter2, user: userId };
  }

  const wallet = await userWalletLean
    .findOne({ ...filter, ...filter2 })
    .populate([populateUser(), populateTrackEdit(), populateTrackView()])
    .lean();

  if (!wallet) {
    return res.status(404).send({ success: false, err: 'not found' });
  }

  return res.status(200).send(wallet);
});

walletRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
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
    const response: IdataArrayResponse <TuserWallet> = {
      count: all[1],
      data: all[0]
    };

    return res.status(200).send(response);
  }
);

walletRoutes.get(
  '/getbyrole/:offset/:limit/:role',
  requireAuth,
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
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
    const response: IdataArrayResponse<TuserWallet> = {
      count: all[1],
      data: walletsToReturn
    };

    return res.status(200).send(response);
  }
);

walletRoutes.post(
  '/filter',
  requireAuth,
  async(req: IcustomRequest<never, IfilterProps & { extraDetails}>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const { searchterm, searchKey, extraDetails } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    let filters;

    switch (searchKey) {
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

    /* const aggCursor = invoiceLean
 .aggregate<IfilterAggResponse<soth>>([
  ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
]);
  const dataArr: IfilterAggResponse<soth>[] = [];

  for await (const data of aggCursor) {
    dataArr.push(data);
  }

  const all = dataArr[0]?.data || [];
  const count = dataArr[0]?.total?.count || 0;
  */

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
    const response: IdataArrayResponse<TuserWallet> = {
      count: all[1],
      data: walletsToReturn
    };

    return res.status(200).send(response);
  }
);

walletRoutes.put('/update', requireAuth);

walletRoutes.post('/update/img', requireAuth);

walletRoutes.put('/delete/one', requireAuth, async(req: IcustomRequest<never, { _id: string}>, res) => {
  const { _id } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  // const deleted = await userWalletMain.findOneAndDelete({ _id, ...filter });
  const deleted = await userWalletMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

walletRoutes.put(
  '/delete/many',
  requireAuth,
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    /* const deleted = await userWalletMain
    .deleteMany({ _id: { $in: _ids }, ...filter })
    .catch(err => {
      walletRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

    const deleted = await userWalletMain
      .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        walletRoutesLogger.error('deletemany - err: ', err);

        return null;
      });

    if (Boolean(deleted)) {
      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({
        uccess: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
  }
);


