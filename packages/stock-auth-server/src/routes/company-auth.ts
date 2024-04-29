import { Icustomrequest, TsubscriptionFeature } from '@open-stock/stock-universal';
import { getLogger } from 'log4js';
import { companySubscriptionLean, companySubscriptionMain } from '../models/subscriptions/company-subscription.model';

/** Logger for company auth */
const companyAuthLogger = getLogger('company-auth');

export const requireCanUseFeature = (
  feature: TsubscriptionFeature
) => {
  return async(
    req,
    res,
    next
  ) => {
    companyAuthLogger.info('requireCanUseFeature');
    const { userId } = (req as Icustomrequest).user;
    if (userId === 'superAdmin') {
      return next();
    }
    const now = new Date();
    const { companyId } = (req as Icustomrequest).user;
    const subsctn = await companySubscriptionLean.findOne({ companyId })
      .lean()
      .gte('endDate', now)
      .sort({ endDate: 1 });

    if (!subsctn) {
      return res.status(401)
        .send('unauthorised no subscription found');
    }

    const found = subsctn.features.find(val => val.type === feature);
    if (!found || found.limitSize === 0 || found.remainingSize === 0) {
      return res.status(401)
        .send({ success: false, err: 'unauthorised feature exhausted' });
    }

    return next();
  };
};

export const requireActiveCompany = (
  req,
  res,
  next
) => {
  companyAuthLogger.info('requireActiveCompany');
  const { userId } = (req as Icustomrequest).user;
  if (userId === 'superAdmin') {
    return next();
  }
  const { companyPermissions } = (req as Icustomrequest).user;
  // no company
  if (companyPermissions && !companyPermissions.active) {
    return res.status(401)
      .send({ success: false, err: 'unauthorised' });
  }

  return next();
};

export const requireUpdateSubscriptionRecord = (
  feature: TsubscriptionFeature
) => {
  return async(
    req,
    res
  ) => {
    companyAuthLogger.info('requireUpdateSubscriptionRecord');
    console.log('requireUpdateSubscriptionRecord');
    const { userId } = (req as Icustomrequest).user;
    if (userId === 'superAdmin') {
      return res.status(200).send({ success: true });
    }
    const now = new Date();
    const { companyId } = (req as Icustomrequest).user;
    const subsctn = await companySubscriptionMain.findOneAndUpdate({ companyId })
      .gte('endDate', now)
      .sort({ endDate: 1 });
    console.log('subsctn is ', subsctn);
    if (!subsctn) {
      return res.status(401)
        .send({ success: false, err: 'unauthorised no subscription found' });
    }

    const features = subsctn.features;
    const foundIndex = features.findIndex(val => val.type === feature);
    features[foundIndex].remainingSize -= 1;
    const saved = await subsctn.save();
    subsctn.features = features;
    console.log('saved isssssss ', saved);
    return res.status(200).send({ success: Boolean(saved) });
  };
};

