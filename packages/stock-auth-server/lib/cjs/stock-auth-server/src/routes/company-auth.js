"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUpdateSubscriptionRecord = exports.checkCompanyIdIfSuperAdminOrCanByPassCompanyId = exports.requireActiveCompany = exports.requireCanUseFeature = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const company_subscription_model_1 = require("../models/subscriptions/company-subscription.model");
/** Logger for company auth */
const companyAuthLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
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
const requireCanUseFeature = (feature) => {
    return async (req, res, next) => {
        companyAuthLogger.info('requireCanUseFeature');
        const { userId } = req.user;
        if (userId === 'superAdmin') {
            return next();
        }
        const now = new Date();
        const { companyId } = req.user;
        const subsctn = await company_subscription_model_1.companySubscriptionLean
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
exports.requireCanUseFeature = requireCanUseFeature;
/**
 * Middleware that checks if the current user's company is active.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the chain.
 * @returns Calls the next middleware function if the user's company is active, otherwise sends a 401 Unauthorized response.
 */
const requireActiveCompany = (req, res, next) => {
    companyAuthLogger.info('requireActiveCompany');
    const { userId } = req.user;
    if (userId === 'superAdmin') {
        if (req.params.companyIdParam && req.params.companyIdParam !== 'undefined' && req.params.companyIdParam !== 'all') {
            const isValid = (0, stock_universal_server_1.verifyObjectId)(req.params.companyIdParam);
            if (!isValid) {
                return res.status(401).send({ success: false, err: 'unauthorised' });
            }
        }
        return next();
    }
    const { companyPermissions, superAdimPerms } = req.user;
    if (superAdimPerms && superAdimPerms.byPassActiveCompany) {
        if (req.params.companyIdParam && req.params.companyIdParam !== 'undefined' && req.params.companyIdParam !== 'all') {
            const isValid = (0, stock_universal_server_1.verifyObjectId)(req.params.companyIdParam);
            if (!isValid) {
                return res.status(401).send({ success: false, err: 'unauthorised' });
            }
        }
        return next();
    }
    // no company
    if (companyPermissions && !companyPermissions.active) {
        return res.status(401).send({ success: false, err: 'unauthorised' });
    }
    return next();
};
exports.requireActiveCompany = requireActiveCompany;
/**
   * Middleware that checks if the companyIdParam is valid ObjectId.
   * If the user is superAdmin or has byPassActiveCompany permission, it checks the companyIdParam.
   * If the companyIdParam is invalid, it sends a 401 Unauthorized response.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the chain.
   * @returns Calls the next middleware function if the companyIdParam is valid, otherwise sends a 401 Unauthorized response.
   */
const checkCompanyIdIfSuperAdminOrCanByPassCompanyId = (req, res, next) => {
    const { userId, superAdimPerms } = req.user || {};
    if (userId === 'superAdmin' || (superAdimPerms && superAdimPerms.byPassActiveCompany)) {
        const isValid = (0, stock_universal_server_1.verifyObjectId)(req.params.companyIdParam);
        if (!isValid) {
            return res.status(401).send({ success: false, err: 'unauthorised' });
        }
        return next();
    }
};
exports.checkCompanyIdIfSuperAdminOrCanByPassCompanyId = checkCompanyIdIfSuperAdminOrCanByPassCompanyId;
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
const requireUpdateSubscriptionRecord = (feature) => {
    return async (req, res) => {
        companyAuthLogger.info('requireUpdateSubscriptionRecord');
        const { userId } = req.user;
        if (userId === 'superAdmin') {
            return res.status(200).send({ success: true });
        }
        const now = new Date();
        const { companyId } = req.user;
        const subsctn = await company_subscription_model_1.companySubscriptionLean
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
        let savedErr;
        /* const saved = await subsctn.save().catch(err => {
          companyAuthLogger.error('save error', err);
          savedErr = err;
          return null;
        }); */
        const updated = await company_subscription_model_1.companySubscriptionMain
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
exports.requireUpdateSubscriptionRecord = requireUpdateSubscriptionRecord;
//# sourceMappingURL=company-auth.js.map