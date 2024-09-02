"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companySubscriptionRoutes = exports.getDays = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const company_model_1 = require("../../models/company.model");
const company_subscription_model_1 = require("../../models/subscriptions/company-subscription.model");
const user_model_1 = require("../../models/user.model");
const stock_auth_server_1 = require("../../stock-auth-server");
const company_auth_1 = require("../company-auth");
/** Logger for companySubscription routes */
const companySubscriptionRoutesLogger = tracer.colorConsole({
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
 * Fires the Pesapal relegator to initiate a payment for a company subscription.
 *
 * @param subctn - The subscription package details.
 * @param savedSub - The saved company subscription document.
 * @param company - The company details.
 * @param currUser - The current user details.
 * @returns An object with the success status and the Pesapal order response, or an error object if the operation fails.
 */
const firePesapalRelegator = async (subctn, savedSub, company, currUser) => {
    const payDetails = {
        id: savedSub._id.toString(),
        currency: 'USD',
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
    const response = await stock_auth_server_1.pesapalPaymentInstance.submitOrder(payDetails, subctn._id, 'Complete product payment');
    if (!response.success) {
        return { success: false, err: response.err };
    }
    const companySub = await company_subscription_model_1.companySubscriptionMain.findByIdAndUpdate(savedSub._id);
    companySub.pesaPalorderTrackingId =
        response.pesaPalOrderRes.order_tracking_id;
    let savedErr;
    await companySub.save().catch((err) => {
        companySubscriptionRoutesLogger.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return { success: false };
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
    }
    return response;
};
exports.getDays = getDays;
/**
 * Router for handling companySubscription-related routes.
 */
exports.companySubscriptionRoutes = express_1.default.Router();
exports.companySubscriptionRoutes.post('/subscribe/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('subscriptions', 'create'), async (req, res) => {
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
    const endDate = now.setDate(now.getDate() + (0, exports.getDays)(subscriptionPackage.duration));
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
    let savedErr;
    const savedSub = await newCompSub.save().catch(err => {
        companySubscriptionRoutesLogger.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedSub && savedSub._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, savedSub._id, company_subscription_model_1.companySubscriptionMain.collection.collectionName, 'makeTrackEdit');
    }
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
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
exports.companySubscriptionRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('subscriptions', 'delete'), async (req, res) => {
    const { id } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // const deleted = await companySubscriptionMain.findOneAndDelete({ _id: id, companyId: queryId });
    const deleted = await company_subscription_model_1.companySubscriptionMain.updateOne({ _id: id, companyId: queryId }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, id, company_subscription_model_1.companySubscriptionMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=company-subscription.routes.js.map