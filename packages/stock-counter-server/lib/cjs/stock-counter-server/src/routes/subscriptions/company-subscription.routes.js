"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companySubscriptionRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const company_subscription_model_1 = require("../../models/subscriptions/company-subscription.model");
/** Logger for companySubscription routes */
const companySubscriptionRoutesLogger = (0, log4js_1.getLogger)('routes/companySubscriptionRoutes');
/**
 * Router for handling companySubscription-related routes.
 */
exports.companySubscriptionRoutes = express_1.default.Router();
exports.companySubscriptionRoutes.post('/subscribe/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), async (req, res) => {
    const { companySubscription } = req.body;
    const newCompSub = new company_subscription_model_1.companySubscriptionMain(companySubscription);
    await newCompSub.save();
    return res.status(200).send({ success: true, status: 200 });
});
exports.companySubscriptionRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const companySubscriptions = await company_subscription_model_1.companySubscriptionLean
        .find({ companyId: queryId })
        .populate({ path: 'user', model: stock_auth_server_1.userLean })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(companySubscriptions);
});
exports.companySubscriptionRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), async (req, res) => {
    const { id } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await company_subscription_model_1.companySubscriptionMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=company-subscription.routes.js.map