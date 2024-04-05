import { Icustomrequest, TsubscriptionFeature } from '@open-stock/stock-universal';
import { companySubscriptionLean } from '../models/subscriptions/company-subscription.model';

export const requireCanUseFeature = (
  feature: TsubscriptionFeature
) => {
  return async(
    req,
    res,
    next
  ) => {
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

    const found = subsctn.features.find(val => val.name === feature);
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
    const now = new Date();
    const { companyId } = (req as Icustomrequest).user;
    const subsctn = await companySubscriptionLean.findOneAndUpdate({ companyId })
      .lean()
      .gte('endDate', now)
      .sort({ endDate: 1 });

    if (!subsctn) {
      return res.status(401)
        .send({ success: false, err: 'unauthorised no subscription found' });
    }

    const features = subsctn.features;
    const foundIndex = features.findIndex(val => val.name === feature);
    features[foundIndex].remainingSize--;
    const saved = await subsctn.save();
    return res.status(200).send({ success: Boolean(saved) });
  };
};
