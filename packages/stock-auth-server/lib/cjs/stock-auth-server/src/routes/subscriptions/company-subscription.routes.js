"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.companySubscriptionRoutes = exports.getDays = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = require("mongoose");
const company_model_1 = require("../../models/company.model");
const company_subscription_model_1 = require("../../models/subscriptions/company-subscription.model");
const user_model_1 = require("../../models/user.model");
const stock_auth_server_1 = require("../../stock-auth-server");
const company_auth_1 = require("../company-auth");
/**
 * Fires the Pesapal relegator to initiate a payment for a company subscription.
 *
 * @param subctn - The subscription package details.
 * @param savedSub - The saved company subscription document.
 * @param company - The company details.
 * @param currUser - The current user details.
 * @returns An object with the success status and the Pesapal order response, or an error object if the operation fails.
 */
const firePesapalRelegator = async (subctn, savedSub, company, currUser) => {
    stock_universal_server_1.mainLogger.info('Firing Pesapal payment for subscription');
    const payDetails = {
        id: savedSub._id.toString(),
        currency: 'USD',
        amount: subctn.amount,
        description: 'Complete payments for subscription ,' + subctn.name,
        callback_url: stock_auth_server_1.pesapalPaymentInstance.config.pesapalCallbackUrl, // TODO add proper callback url,
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
    const response = await stock_auth_server_1.pesapalPaymentInstance.submitOrder(payDetails, subctn._id, 'Complete product payment');
    stock_universal_server_1.mainLogger.debug('firePesapalRelegator::Pesapal payment failed', response);
    if (!response.success || !response.pesaPalOrderRes) {
        return { success: false, err: response.err };
    }
    const updateRes = await company_subscription_model_1.companySubscriptionMain.updateOne({
        _id: savedSub._id
    }, {
        $set: {
            pesaPalorderTrackingId: response.pesaPalOrderRes.order_tracking_id
        }
    }).catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return { success: errResponse.success, err: errResponse.err };
    }
    return {
        success: true,
        pesaPalOrderRes: {
            redirect_url: response.pesaPalOrderRes.redirect_url
        }
    };
};
/**
 * Calculates the number of days based on the provided duration.
 *
 * @param duration - The duration in months.
 * @returns The number of days for the given duration.
 */
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
        default:
            response = 30;
            break;
    }
    return response;
};
exports.getDays = getDays;
/**
 * Router for handling companySubscription-related routes.
 */
exports.companySubscriptionRoutes = express_1.default.Router();
exports.companySubscriptionRoutes.post('/subscribe', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('subscriptions', 'create'), async (req, res) => {
    stock_universal_server_1.mainLogger.info('making companySubscriptionRoutes');
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId } = req.user;
    const subscriptionPackage = req.body;
    let response;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const startDate = new Date();
    const now = new Date();
    let endDate = Date.now();
    if (subscriptionPackage.duration) {
        endDate = now.setDate(now.getDate() + (0, exports.getDays)(subscriptionPackage.duration));
    }
    const companySubObj = {
        name: subscriptionPackage.name,
        amount: subscriptionPackage.amount,
        duration: subscriptionPackage.duration,
        active: true,
        subscriprionId: subscriptionPackage._id,
        startDate,
        endDate,
        pesaPalorderTrackingId: '',
        status: companyId === 'superAdmin' ? 'paid' : 'pending',
        features: subscriptionPackage.features
    };
    const newCompSub = new company_subscription_model_1.companySubscriptionMain(companySubObj);
    const savedSub = await newCompSub.save().catch((err) => err);
    if (savedSub instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedSub);
        return res.status(errResponse.status).send(errResponse);
    }
    if (savedSub && savedSub._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, savedSub._id, company_subscription_model_1.companySubscriptionMain.collection.collectionName, 'makeTrackEdit');
    }
    stock_universal_server_1.mainLogger.info('companyId-', companyId);
    if (companyId !== 'superAdmin') {
        const company = await company_model_1.companyLean.findById(companyId).lean();
        if (!company) {
            stock_universal_server_1.mainLogger.info('did not find company');
            await company_subscription_model_1.companySubscriptionMain.deleteOne({ _id: savedSub._id });
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const currUser = await user_model_1.userLean.findOne({ _id: company.owner }).lean();
        if (!currUser) {
            stock_universal_server_1.mainLogger.info('did not find user');
            await company_subscription_model_1.companySubscriptionMain.deleteOne({ _id: savedSub._id });
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        response = await firePesapalRelegator(newCompSub, savedSub, company, currUser);
        stock_universal_server_1.mainLogger.debug('firePesapalRelegator::response', response);
        if (!response.success) {
            await company_subscription_model_1.companySubscriptionMain.deleteOne({ _id: savedSub._id });
            return res.status(401).send({ success: false, status: 401, err: response.err });
        }
    }
    return res.status(200).send({ success: true, data: response });
});
exports.companySubscriptionRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, async (req, res) => {
    stock_universal_server_1.mainLogger.info('getall');
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId } = req.user;
    let query;
    if (companyId !== 'superAdmin') {
        query = { companyId };
    }
    else {
        query = { ...(0, stock_universal_server_1.makePredomFilter)(req) };
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
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, company_subscription_model_1.companySubscriptionMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.companySubscriptionRoutes.post('/filter', stock_universal_server_1.requireAuth, async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const filter = (0, stock_universal_server_1.constructFiltersFromBody)(req);
    const aggCursor = company_subscription_model_1.companySubscriptionLean
        .aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...(0, stock_universal_server_1.lookupTrackEdit)(),
        ...(0, stock_universal_server_1.lookupTrackView)(),
        ...(0, stock_universal_server_1.lookupFacet)(offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const response = {
        count,
        data: all
    };
    for (const val of all) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, company_subscription_model_1.companySubscriptionLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.companySubscriptionRoutes.put('/delete/one', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('subscriptions', 'delete'), async (req, res) => {
    stock_universal_server_1.mainLogger.info('deleteone');
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { _id } = req.body;
    const { companyId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // const deleted = await companySubscriptionMain.findOneAndDelete({ _id, });
    const updateRes = await company_subscription_model_1.companySubscriptionMain
        .updateOne({ _id }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, company_subscription_model_1.companySubscriptionMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=company-subscription.routes.js.map