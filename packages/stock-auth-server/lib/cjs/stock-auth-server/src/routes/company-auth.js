"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUpdateSubscriptionRecord = exports.requireActiveCompany = exports.requireCanUseFeature = void 0;
const tslib_1 = require("tslib");
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
const requireCanUseFeature = (feature) => {
    return async (req, res, next) => {
        companyAuthLogger.info('requireCanUseFeature');
        const { userId } = req.user;
        if (userId === 'superAdmin') {
            return next();
        }
        const now = new Date();
        const { companyId } = req.user;
        const subsctn = await company_subscription_model_1.companySubscriptionLean.findOne({ companyId })
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
exports.requireCanUseFeature = requireCanUseFeature;
const requireActiveCompany = (req, res, next) => {
    companyAuthLogger.info('requireActiveCompany');
    const { userId } = req.user;
    if (userId === 'superAdmin') {
        return next();
    }
    const { companyPermissions } = req.user;
    // no company
    if (companyPermissions && !companyPermissions.active) {
        return res.status(401)
            .send({ success: false, err: 'unauthorised' });
    }
    return next();
};
exports.requireActiveCompany = requireActiveCompany;
const requireUpdateSubscriptionRecord = (feature) => {
    return async (req, res) => {
        companyAuthLogger.info('requireUpdateSubscriptionRecord');
        const { userId } = req.user;
        if (userId === 'superAdmin') {
            return res.status(200).send({ success: true });
        }
        const now = new Date();
        const { companyId } = req.user;
        const subsctn = await company_subscription_model_1.companySubscriptionMain.findOneAndUpdate({ companyId })
            .gte('endDate', now)
            .sort({ endDate: 1 });
        if (!subsctn) {
            return res.status(401)
                .send({ success: false, err: 'unauthorised no subscription found' });
        }
        const features = subsctn.features.slice();
        const foundIndex = features.findIndex(val => val.type === feature);
        features[foundIndex].remainingSize -= 1;
        subsctn.features = features;
        let savedErr;
        const saved = await subsctn.save().catch(err => {
            companyAuthLogger.error('save error', err);
            savedErr = err;
            return null;
        });
        if (savedErr) {
            return res.status(500).send({ success: false });
        }
        return res.status(200).send({ success: Boolean(saved) });
    };
};
exports.requireUpdateSubscriptionRecord = requireUpdateSubscriptionRecord;
//# sourceMappingURL=company-auth.js.map