/* eslint-disable @typescript-eslint/naming-convention */
import { addParentToLocals, constructFiltersFromBody, handleMongooseErr, lookupFacet, lookupTrackEdit, lookupTrackView, mainLogger, makePredomFilter, offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { companyLean } from '../../models/company.model';
import { companySubscriptionLean, companySubscriptionMain } from '../../models/subscriptions/company-subscription.model';
import { userLean } from '../../models/user.model';
import { pesapalPaymentInstance } from '../../stock-auth-server';
import { requireActiveCompany } from '../company-auth';
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
    mainLogger.info('Firing Pesapal payment for subscription');
    const payDetails = {
        id: savedSub._id.toString(),
        currency: 'USD',
        amount: subctn.amount,
        description: 'Complete payments for subscription ,' + subctn.name,
        callback_url: pesapalPaymentInstance.config.pesapalCallbackUrl, // TODO add proper callback url,
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
    const response = await pesapalPaymentInstance.submitOrder(payDetails, subctn._id, 'Complete product payment');
    mainLogger.debug('firePesapalRelegator::Pesapal payment failed', response);
    if (!response.success || !response.pesaPalOrderRes) {
        return { success: false, err: response.err };
    }
    const updateRes = await companySubscriptionMain.updateOne({
        _id: savedSub._id
    }, {
        $set: {
            pesaPalorderTrackingId: response.pesaPalOrderRes.order_tracking_id
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
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
export const getDays = (duration) => {
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
/**
 * Router for handling companySubscription-related routes.
 */
export const companySubscriptionRoutes = express.Router();
companySubscriptionRoutes.post('/subscribe', requireAuth, requireActiveCompany, roleAuthorisation('subscriptions', 'create'), async (req, res) => {
    mainLogger.info('making companySubscriptionRoutes');
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId } = req.user;
    const subscriptionPackage = req.body;
    let response;
    const isValid = verifyObjectId(companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const startDate = new Date();
    const now = new Date();
    let endDate = Date.now();
    if (subscriptionPackage.duration) {
        endDate = now.setDate(now.getDate() + getDays(subscriptionPackage.duration));
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
    const newCompSub = new companySubscriptionMain(companySubObj);
    const savedSub = await newCompSub.save().catch((err) => err);
    if (savedSub instanceof Error) {
        const errResponse = handleMongooseErr(savedSub);
        return res.status(errResponse.status).send(errResponse);
    }
    if (savedSub && savedSub._id) {
        addParentToLocals(res, savedSub._id, companySubscriptionMain.collection.collectionName, 'makeTrackEdit');
    }
    mainLogger.info('companyId-', companyId);
    if (companyId !== 'superAdmin') {
        const company = await companyLean.findById(companyId).lean();
        if (!company) {
            mainLogger.info('did not find company');
            await companySubscriptionMain.deleteOne({ _id: savedSub._id });
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const currUser = await userLean.findOne({ _id: company.owner }).lean();
        if (!currUser) {
            mainLogger.info('did not find user');
            await companySubscriptionMain.deleteOne({ _id: savedSub._id });
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        response = await firePesapalRelegator(newCompSub, savedSub, company, currUser);
        mainLogger.debug('firePesapalRelegator::response', response);
        if (!response.success) {
            await companySubscriptionMain.deleteOne({ _id: savedSub._id });
            return res.status(401).send({ success: false, status: 401, err: response.err });
        }
    }
    return res.status(200).send({ success: true, data: response });
});
companySubscriptionRoutes.get('/all/:offset/:limit', requireAuth, async (req, res) => {
    mainLogger.info('getall');
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId } = req.user;
    let query;
    if (companyId !== 'superAdmin') {
        query = { companyId };
    }
    else {
        query = { ...makePredomFilter(req) };
    }
    const all = await Promise.all([
        companySubscriptionLean
            .find(query)
            .skip(offset)
            .limit(limit)
            .lean(),
        companySubscriptionLean.countDocuments(query)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, companySubscriptionMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
companySubscriptionRoutes.post('/filter', requireAuth, async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const filter = constructFiltersFromBody(req);
    const aggCursor = companySubscriptionLean
        .aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...lookupTrackEdit(),
        ...lookupTrackView(),
        ...lookupFacet(offset, limit, propSort, returnEmptyArr)
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
        addParentToLocals(res, val._id, companySubscriptionLean.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
companySubscriptionRoutes.put('/delete/one', requireAuth, requireActiveCompany, roleAuthorisation('subscriptions', 'delete'), async (req, res) => {
    mainLogger.info('deleteone');
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { _id } = req.body;
    const { companyId } = req.user;
    const isValid = verifyObjectIds([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // const deleted = await companySubscriptionMain.findOneAndDelete({ _id, });
    const updateRes = await companySubscriptionMain
        .updateOne({ _id }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, companySubscriptionMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=company-subscription.routes.js.map