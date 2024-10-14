
import { populateTrackEdit, populateTrackView } from '@open-stock/stock-auth-server';
import { IcustomRequest, IdataArrayResponse, IdeleteMany, IfilterProps } from '@open-stock/stock-universal';
import {
  handleMongooseErr, makeCompanyBasedQuery, offsetLimitRelegator,
  requireAuth, verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
import {
  TuserWalletHistory,
  userWalletHistoryLean,
  userWalletHistoryMain
} from '../../models/printables/wallet/user-wallet-history.model';
import { populateUser } from '../../utils/query';

export const makeWalletHistoryQuery = (walletHistory: TuserWalletHistory) => {
  const newWalletHist = new userWalletHistoryMain(walletHistory);
  const savedRes = newWalletHist.save().catch((err: Error) => err);

  return savedRes;
};

/**
 * Router for wallet related routes.
 */
export const walletHistoryRoutes = express.Router();


walletHistoryRoutes.post(
  '/one',
  requireAuth,
  async(req: IcustomRequest<never, {_id?: string; userId?: string; urId?: string}>, res) => {
    const { _id, userId, urId } = req.body;

    if (!_id && !userId && !urId) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { filter } = makeCompanyBasedQuery(req);
    let filter2 = {};

    if (urId) {
      filter2 = { ...filter2, urId };
    }

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

    const wallet = await userWalletHistoryLean
      .findOne({ ...filter, ...filter2 })
      .populate([populateUser(), populateTrackEdit(), populateTrackView()])
      .lean();

    if (!wallet) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    return res.status(200).send(wallet);
  }
);

walletHistoryRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      userWalletHistoryLean
        .find({ ...filter })
        .populate([populateUser(), populateTrackEdit(), populateTrackView()])
        .skip(offset)
        .limit(limit)
        .lean(),
      userWalletHistoryLean.countDocuments({ ...filter })
    ]);
    const response: IdataArrayResponse <TuserWalletHistory> = {
      count: all[1],
      data: all[0]
    };

    return res.status(200).send(response);
  }
);

walletHistoryRoutes.post(
  '/filter',
  requireAuth,
  async(req: IcustomRequest<never, IfilterProps & { extraDetails}>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const { filter } = makeCompanyBasedQuery(req);
    let filters;


    const all = await Promise.all([
      userWalletHistoryLean
        .find({ ...filter, ...filters })
        .populate([populateUser(), populateTrackEdit(), populateTrackView()])
        .skip(offset)
        .limit(limit)
        .lean(),
      userWalletHistoryLean.countDocuments({ ...filter, ...filters })
    ]);
    const response: IdataArrayResponse<TuserWalletHistory> = {
      count: all[1],
      data: all[0]
    };

    return res.status(200).send(response);
  }
);

walletHistoryRoutes.put('/delete/one', requireAuth, async(req: IcustomRequest<never, { _id: string}>, res) => {
  const { _id } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  // const deleted = await userWalletHistoryMain.findOneAndDelete({ _id, ...filter });
  const updateRes = await userWalletHistoryMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
    .catch((err: Error) => err);

  if (updateRes instanceof Error) {
    const errResponse = handleMongooseErr(updateRes);

    return res.status(errResponse.status).send(errResponse);
  }

  return res.status(200).send({ success: true });
});

walletHistoryRoutes.put(
  '/delete/many',
  requireAuth,
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const updateRes = await userWalletHistoryMain
      .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
      }).catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    return res.status(200).send({ success: true });
  }
);


