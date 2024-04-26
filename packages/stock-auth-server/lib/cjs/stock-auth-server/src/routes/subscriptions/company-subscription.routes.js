"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companySubscriptionRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const company_model_1 = require("../../models/company.model");
const company_subscription_model_1 = require("../../models/subscriptions/company-subscription.model");
const user_model_1 = require("../../models/user.model");
const stock_auth_server_1 = require("../../stock-auth-server");
const company_auth_1 = require("../company-auth");
/** Logger for companySubscription routes */
const companySubscriptionRoutesLogger = (0, log4js_1.getLogger)('routes/companySubscriptionRoutes');
const firePesapalRelegator = async (subctn, savedSub, company, currUser) => {
    console.log('PESAPAL IS ', stock_auth_server_1.pesapalPaymentInstance.config);
    const payDetails = {
        id: savedSub._id,
        currency: 'UGX',
        amount: subctn.ammount,
        description: 'Complete payments for subscription ,' + subctn.name,
        callback_url: stock_auth_server_1.pesapalPaymentInstance.config.pesapalCallbackUrl,
        cancellation_url: '',
        notification_id: '',
        billing_address: {
            email_address: currUser.email,
            phone_number: currUser.phone.toString(),
            country_code: 'UG',
            first_name: company.displayName,
            middle_name: '',
            last_name: '',
            line_1: '',
            line_2: '',
            city: '',
            state: '',
            // postal_code: paymentRelated.shippingAddress,
            zip_code: ''
        }
    };
    console.log('PAY Details ', payDetails);
    const response = await stock_auth_server_1.pesapalPaymentInstance.submitOrder(payDetails, subctn._id, 'Complete product payment');
    console.log('RESPONSE ISSSSS ', response);
    if (!response.success) {
        return { success: false, err: response.err };
    }
    const companySub = await company_subscription_model_1.companySubscriptionMain.findByIdAndUpdate(savedSub._id);
    companySub.pesaPalorderTrackingId = response.pesaPalOrderRes.order_tracking_id;
    await companySub.save();
    return {
        success: true,
        pesaPalOrderRes: {
            redirect_url: response.pesaPalOrderRes.redirect_url
        }
    };
};
const getDays = (duration) => {
    let response;
    switch (duration) {
        case 1:
            response = 30;
            break;
        case 2:
            response = 60;
            break;
        case 3:
            response = 60;
            break;
        case 6:
            response = 6 * 30;
            break;
        case 12:
            response = 12 * 30;
            break;
    }
    return response;
};
/**
 * Router for handling companySubscription-related routes.
 */
exports.companySubscriptionRoutes = express_1.default.Router();
exports.companySubscriptionRoutes.post('/subscribe/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('payments', 'create'), async (req, res) => {
    companySubscriptionRoutesLogger.info('making companySubscriptionRoutes');
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const subscriptionPackage = req.body;
    let response;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const startDate = new Date();
    const now = new Date();
    const endDate = now.setDate(now.getDate() + getDays(subscriptionPackage.duration));
    const companySubObj = {
        name: subscriptionPackage.name,
        ammount: subscriptionPackage.ammount,
        duration: subscriptionPackage.duration,
        companyId: queryId,
        active: true,
        subscriprionId: subscriptionPackage._id,
        startDate,
        endDate,
        pesaPalorderTrackingId: '',
        status: companyId === 'superAdmin' ? 'paid' : 'pending',
        features: subscriptionPackage.features
    };
    const newCompSub = new company_subscription_model_1.companySubscriptionMain(companySubObj);
    const savedSub = await newCompSub.save();
    if (companyId !== 'superAdmin') {
        const company = await company_model_1.companyLean.findById(companyId).lean();
        if (!company) {
            await company_subscription_model_1.companySubscriptionMain.deleteOne({ _id: savedSub._id });
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const currUser = await user_model_1.userLean.findOne({ _id: company.owner }).lean();
        if (!currUser) {
            await company_subscription_model_1.companySubscriptionMain.deleteOne({ _id: savedSub._id });
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        response = await firePesapalRelegator(subscriptionPackage, savedSub, company, currUser);
        if (!response.success) {
            await company_subscription_model_1.companySubscriptionMain.deleteOne({ _id: savedSub._id });
            return res.status(401).send({ success: false, status: 401, err: response.err });
        }
    }
    return res.status(200).send({ success: true, data: response });
});
exports.companySubscriptionRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    let query;
    if (companyId !== 'superAdmin') {
        query = { companyId };
    }
    else {
        query = {};
    }
    const all = await Promise.all([
        company_subscription_model_1.companySubscriptionLean
            .find(query)
            .skip(offset)
            .limit(limit)
            .lean(),
        company_subscription_model_1.companySubscriptionLean.countDocuments(query)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.companySubscriptionRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('payments', 'delete'), async (req, res) => {
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