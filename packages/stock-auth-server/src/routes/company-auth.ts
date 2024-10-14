import { IcustomRequest, TsubscriptionFeature } from '@open-stock/stock-universal';
import { handleMongooseErr, mainLogger } from '@open-stock/stock-universal-server';
import { Error } from 'mongoose';
import { companySubscriptionLean, companySubscriptionMain } from '../models/subscriptions/company-subscription.model';

/**
 * Middleware that checks if the current user has the required subscription feature to access the requested resource.
 *
 * @param feature - The subscription feature that is required to access the resource.
 * @returns A middleware function that can be used in an Express route handler.
 */
export const requireCanUseFeature = (feature: TsubscriptionFeature) => {
  return async(req: IcustomRequest<never, unknown>, res, next) => {
    mainLogger.info('requireCanUseFeature');
    if (!req.user) {
      return res.status(401).send('unauthorised no user found');
    }
    const { userId } = req.user;

    if (userId === 'superAdmin') {
      return next();
    }

    const now = new Date();
    const { companyId } = req.user;
    const subsctn = await companySubscriptionLean
      .find({
        companyId,
        features: { $elemMatch: { type: feature, remainingSize: { $gte: 1 } } }
      })
      .lean()
      .gte('endDate', now)
      .sort({ endDate: 1 });

    if (!subsctn[0]) {
      return res.status(401).send('unauthorised no subscription found');
    }

    const found = subsctn[0].features.find((val) => val.type === feature);

    if (!found || found.limitSize === 0 || found.remainingSize === 0) {
      return res
        .status(401)
        .send({ success: false, err: 'unauthorised feature exhausted' });
    }

    return next();
  };
};

/**
 * Middleware that checks if the current user's company is active.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the chain.
 * @returns Calls the next middleware function if the user's company is active,
 * otherwise sends a 401 Unauthorized response.
 */
export const requireActiveCompany = (req: IcustomRequest<never, unknown>, res, next) => {
  mainLogger.info('requireActiveCompany');
  if (!req.user) {
    return res.status(401).send('unauthorised no user found');
  }
  const { userId } = req.user;

  if (userId === 'superAdmin') {
    return next();
  }
  const { companyPermissions, superAdimPerms } = req.user;

  if (superAdimPerms && superAdimPerms.byPassActiveCompany) {
    return next();
  }

  // no company
  if (companyPermissions && !companyPermissions.active) {
    return res.status(401).send({ success: false, err: 'unauthorised' });
  }

  return next();
};

/**
   * Middleware that checks if the companyIdParam is valid ObjectId.
   * If the user is superAdmin or has byPassActiveCompany permission, it checks the companyIdParam.
   * If the companyIdParam is invalid, it sends a 401 Unauthorized response.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the chain.
   * @returns Calls the next middleware function if the companyIdParam is valid,
   * otherwise sends a 401 Unauthorized response.
   */
/* export const checkCompanyIdIfSuperAdminOrCanByPassCompanyId = (
  req: IcustomRequest<never, unknown>,
  res: Response,
  next: NextFunction
) => {
  mainLogger.info('checkCompanyIdIfSuperAdminOrCanByPassCompanyId');
  const { userId, superAdimPerms } = req.user || {};

  if (userId === 'superAdmin' || (superAdimPerms && superAdimPerms.byPassActiveCompany)) {
    const isValid = verifyObjectId(req.params.companyIdParam);

    if (!isValid) {
      return res.status(401).send({ success: false, err: 'unauthorised' });
    }

    return next();
  }
}; */

/**
 * Middleware that checks if the current user's company has a valid subscription for the given feature.
 *
 * @param feature - The type of subscription feature to check.
 * @returns A middleware function that:
 * - Checks if the user is a super admin, and if so, allows access.
 * - Finds the user's company's current subscription.
 * - Checks if the subscription is valid and the feature is available.
 * - If the feature is available, decrements the remaining size and updates the subscription.
 * - Returns a 200 OK response if the check passes, or a 401 Unauthorized response if the check fails.
 */
export const requireUpdateSubscriptionRecord = (feature: TsubscriptionFeature) => {
  return async(req: IcustomRequest<never, unknown>, res) => {
    mainLogger.info('requireUpdateSubscriptionRecord');
    if (!req.user) {
      return res.status(401).send({ success: false, err: 'unauthorised' });
    }
    const { userId } = req.user;

    if (userId === 'superAdmin') {
      return res.status(200).send({ success: true });
    }
    const now = new Date();
    const { companyId } = req.user;
    const subsctn = await companySubscriptionLean
      .find({
        companyId,
        features: { $elemMatch: { type: feature, remainingSize: { $gte: 1 } } }
      })
      .gte('endDate', now)
      .sort({ endDate: 1 })
      .lean();

    if (!subsctn[0]) {
      return res
        .status(401)
        .send({ success: false, err: 'unauthorised no subscription found' });
    }

    const features = subsctn[0].features.slice();
    const foundIndex = features.findIndex((val) => val.type === feature);

    if (foundIndex === -1 || !features[foundIndex].remainingSize) {
      return res
        .status(401)
        .send({ success: false, err: 'unauthorised feature exhausted' });
    }

    (features[foundIndex].remainingSize as number) -= 1;
    // subsctn.features = features;

    /* const savedRes = await subsctn.save().catch(err => {
      mainLogger.error('save error', err);
      savedErr = err;
      return null;
    }); */
    const updateRes = await companySubscriptionMain
      .updateOne({ _id: subsctn[0]._id }, { features })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    return res.status(200).send({ success: true, features });
  };
};
