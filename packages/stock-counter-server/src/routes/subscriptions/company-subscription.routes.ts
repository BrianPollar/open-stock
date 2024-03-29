/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getLogger } from 'log4js';
import { Icustomrequest } from '@open-stock/stock-universal';
import { userLean } from '@open-stock/stock-auth-server';
import { offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectIds } from '@open-stock/stock-universal-server';
import { companySubscriptionLean, companySubscriptionMain } from '../../models/subscriptions/company-subscription.model';

/** Logger for companySubscription routes */
const companySubscriptionRoutesLogger = getLogger('routes/companySubscriptionRoutes');

/**
 * Router for handling companySubscription-related routes.
 */
export const companySubscriptionRoutes = express.Router();

companySubscriptionRoutes.post('/subscribe/:companyIdParam', requireAuth, roleAuthorisation('users', 'create'), async(req, res) => {
  const { companySubscription } = req.body;
  const newCompSub = new companySubscriptionMain(companySubscription);
  await newCompSub.save();
  return res.status(200).send({ success: true, status: 200 });
});

companySubscriptionRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const companySubscriptions = await companySubscriptionLean
    .find({ companyId: queryId })
    .populate({ path: 'user', model: userLean })
    .skip(offset)
    .limit(limit)
    .lean();
  return res.status(200).send(companySubscriptions);
});

companySubscriptionRoutes.put('/deleteone/:companyIdParam', requireAuth, roleAuthorisation('users', 'delete'), async(req, res) => {
  const { id } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await companySubscriptionMain.findOneAndDelete({ _id: id, companyId: queryId });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});
