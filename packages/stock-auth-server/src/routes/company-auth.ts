import { Icustomrequest, TsubscriptionFeature } from '@open-stock/stock-universal';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { companySubscriptionLean, companySubscriptionMain } from '../models/subscriptions/company-subscription.model';

/** Logger for company auth */
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

/**
 * Middleware that checks if the current user has the required subscription feature to access the requested resource.
 *
 * @param feature - The subscription feature that is required to access the resource.
 * @returns A middleware function that can be used in an Express route handler.
 */
export const requireCanUseFeature = (feature: TsubscriptionFeature) => {
  return async(req, res, next) => {
    companyAuthLogger.info('requireCanUseFeature');
    const { userId } = (req as Icustomrequest).user;

    if (userId === 'superAdmin') {
      return next();
    }

    const now = new Date();
    const { companyId } = (req as Icustomrequest).user;
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
 * @returns Calls the next middleware function if the user's company is active, otherwise sends a 401 Unauthorized response.
 */
export const requireActiveCompany = (req, res, next) => {
  companyAuthLogger.info('requireActiveCompany');
  const { userId } = (req as Icustomrequest).user;

  if (userId === 'superAdmin') {
    return next();
  }
  const { companyPermissions } = (req as Icustomrequest).user;

  // no company
  if (companyPermissions && !companyPermissions.active) {
    return res.status(401).send({ success: false, err: 'unauthorised' });
  }

  return next();
};

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
  return async(req, res) => {
    companyAuthLogger.info('requireUpdateSubscriptionRecord');
    const { userId } = (req as Icustomrequest).user;

    if (userId === 'superAdmin') {
      return res.status(200).send({ success: true });
    }
    const now = new Date();
    const { companyId } = (req as Icustomrequest).user;
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

    features[foundIndex].remainingSize -= 1;
    // subsctn.features = features;
    let savedErr: string;

    /* const saved = await subsctn.save().catch(err => {
      companyAuthLogger.error('save error', err);
      savedErr = err;
      return null;
    }); */
    const updated = await companySubscriptionMain
      .updateOne({ _id: subsctn[0]._id }, { features })
      .catch((err) => {
        companyAuthLogger.error('updated error', err);
        savedErr = err;

        return null;
      });

    if (savedErr) {
      return res.status(500).send({ success: false });
    }

    return res.status(200).send({ success: Boolean(updated), features });
  };
};

export const requireDeliveryMan = () => {
  return async(req, res, next) => {
    const { userId } = (req as Icustomrequest).user;
  };
};


export const requireVendorManger = () => {
  return async(req, res, next) => {
    const { userId } = (req as Icustomrequest).user;
  };
};

