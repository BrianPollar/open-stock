import { appendUserToReqIfTokenExist, constructFiltersFromBody, lookupSubFieldInvoiceRelatedFilter, makePredomFilter } from '@open-stock/stock-universal-server';
/**
 * Express routes for payment related operations.
 * @remarks
 * This file contains the implementation of the payment routes for the stock-counter-server application.
 * The payment routes include creating a payment, updating a payment, and getting a payment by ID.
 * @packageDocumentation
 */
import express from 'express';
import { paymentLean, paymentMain } from '../models/payment.model';
import { paymentRelatedLean } from '../models/printables/paymentrelated/paymentrelated.model';
// import { paymentInstallsLean } from '../models/printables/paymentrelated/paymentsinstalls.model';
import { invoiceRelatedMain } from '../models/printables/related/invoicerelated.model';
import { deleteAllPayOrderLinked, makePaymentInstall, makePaymentRelatedPdct, relegatePaymentRelatedCreation, updatePaymentRelated } from './paymentrelated/paymentrelated';
// import * as url from 'url';
import { companySubscriptionLean, companySubscriptionMain, populateTrackEdit, populateTrackView, requireActiveCompany, requireSuperAdmin } from '@open-stock/stock-auth-server';
import { addParentToLocals, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { pesapalPaymentInstance } from '../stock-counter-server';
import { populateInvoiceRelated, populatePaymentRelated } from '../utils/query';
import { relegateInvRelatedCreation } from './printables/related/invoicerelated';
const paymentRoutesLogger = tracer.colorConsole({
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
        fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
/**
 * Express router for payment routes.
 */
export const paymentRoutes = express.Router();
/** paymentRoutes
 * .post('/braintreeclenttoken', requireAuth, async (req: IcustomRequest<never, unknown>, res) => {
  const token = await brainTreeInstance.generateToken();
  return res.status(200).send({ token, success: true });
});**/
paymentRoutes.post('/add', requireAuth, async (req, res) => {
    let { payment } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const isValid = verifyObjectId(filter.companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    payment.companyId = filter.companyId;
    const { paymentRelated, invoiceRelated } = req.body;
    if (!payment) {
        payment = {
            paymentRelated: ''
        };
    }
    const extraNotifDesc = 'Newly created order';
    const paymentRelatedRes = await relegatePaymentRelatedCreation(res, paymentRelated, invoiceRelated, 'order', extraNotifDesc, filter.companyId);
    if (!paymentRelatedRes.success) {
        return res.status(paymentRelatedRes.status).send(paymentRelatedRes);
    }
    payment.paymentRelated = paymentRelatedRes._id;
    const payments = invoiceRelated.payments.slice();
    invoiceRelated.payments.length = 0;
    invoiceRelated.payments = [];
    const invoiceRelatedRes = await relegateInvRelatedCreation(res, invoiceRelated, filter.companyId, extraNotifDesc, true);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    payment.invoiceRelated = invoiceRelatedRes._id;
    if (payments && payments.length) {
        await makePaymentInstall(res, payments[0], invoiceRelatedRes._id, filter.companyId, invoiceRelated.creationType);
    }
    const newPaymt = new paymentMain(payment);
    let errResponse;
    const saved = await newPaymt.save()
        .catch(err => {
        paymentRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        addParentToLocals(res, saved._id, paymentMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: Boolean(saved) });
});
paymentRoutes.put('/update', requireAuth, async (req, res) => {
    const { filter } = makeCompanyBasedQuery(req);
    const { updatedPayment, paymentRelated } = req.body;
    updatedPayment.companyId = filter.companyId;
    paymentRelated.companyId = filter.companyId;
    const { _id } = updatedPayment;
    const isValid = verifyObjectIds([_id, filter.companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const payment = await paymentMain
        .findOne({ _id, ...filter })
        .lean();
    if (!payment) {
        return res.status(404).send({ success: false });
    }
    await updatePaymentRelated(paymentRelated, filter.companyId);
    let errResponse;
    const updated = await paymentMain.updateOne({
        _id, ...filter
    }, {
        $set: {
            order: updatedPayment.order || payment.order,
            isDeleted: updatedPayment.isDeleted || payment.isDeleted
        }
    })
        .catch(err => {
        paymentRoutesLogger.info('update - err', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    addParentToLocals(res, _id, paymentMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
});
paymentRoutes.get('/one/:_id', requireAuth, async (req, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const payment = await paymentLean
        .findOne({ _id, ...filter })
        .lean()
        .populate([populatePaymentRelated(), populateInvoiceRelated(true), populateTrackEdit(), populateTrackView()]);
    if (!payment) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const returned = makePaymentRelatedPdct(payment.paymentRelated, payment.invoiceRelated, payment.invoiceRelated
        .billingUserId, payment);
    addParentToLocals(res, payment._id, paymentMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(returned);
});
paymentRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('payments', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        paymentLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([populatePaymentRelated(), populateInvoiceRelated(true), populateTrackEdit(), populateTrackView()]),
        paymentLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of returned) {
        addParentToLocals(res, val._id, paymentMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
paymentRoutes.get('/getmypayments/:offset/:limit', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const isValid = verifyObjectId(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        paymentLean
            .find({ user: userId, ...makePredomFilter(req) })
            .lean()
            .populate([populatePaymentRelated(), populateInvoiceRelated(true), populateTrackEdit(), populateTrackView()]),
        paymentLean.countDocuments({ user: userId, ...makePredomFilter(req) })
    ]);
    const returned = all[0]
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
paymentRoutes.put('/delete/one', requireAuth, requireSuperAdmin, async (req, res) => {
    const { filter } = makeCompanyBasedQuery(req);
    const { _id } = req.body;
    const found = await paymentLean.findOne({ _id });
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await deleteAllPayOrderLinked(found.paymentRelated, found.invoiceRelated, 'payment', filter.companyId);
    // await paymentMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        addParentToLocals(res, _id, paymentMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
paymentRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('payments', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = paymentLean
        .aggregate([
        ...lookupSubFieldInvoiceRelatedFilter(constructFiltersFromBody(req), propSort, offset, limit)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const returned = all
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        addParentToLocals(res, val._id, paymentMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
paymentRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('payments', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const promises = _ids
        .map(async (_id) => {
        const found = await paymentLean.findOne({ _id });
        if (found) {
            await deleteAllPayOrderLinked(found.paymentRelated, found.invoiceRelated, 'payment', filter.companyId);
        }
        return new Promise(resolve => resolve(found._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist) {
        addParentToLocals(res, val, paymentMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
// get ipn
paymentRoutes.get('/ipn', async (req, res) => {
    const currntUrl = new URL(req.url);
    // get access to URLSearchParams object
    const searchParams = currntUrl.searchParams;
    // get url parameters
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const orderNotificationType = searchParams.get('OrderNotificationType');
    const orderMerchantReference = searchParams.get('OrderMerchantReference');
    paymentRoutesLogger.info('ipn - searchParams, %orderTrackingId:, %orderNotificationType:, %orderMerchantReference:', orderTrackingId, orderNotificationType, orderMerchantReference);
    const companySub = await companySubscriptionLean.findOne({ pesaPalorderTrackingId: orderTrackingId }).lean();
    if (companySub) {
        await updateCompanySubStatus(res, orderTrackingId);
        await companySub.save();
        return res.status(200).send({ success: true });
    }
    let savedErr;
    companySub.save().catch(err => {
        paymentRoutesLogger.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
    const related = await paymentRelatedLean.findOne({ pesaPalorderTrackingId: orderTrackingId }).lean();
    if (!pesapalPaymentInstance && !related) {
        return res.status(500).send({ success: false, err: 'internal server error' });
    }
    // return relegatePesaPalNotifications(orderTrackingId, orderNotificationType, orderMerchantReference);
    const response = await pesapalPaymentInstance.getTransactionStatus(orderTrackingId);
    if (response.success) {
        await updateInvoicerelatedStatus(res, orderTrackingId);
    }
    return response;
});
paymentRoutes.get('/paymentstatus/:orderTrackingId/:paymentRelated', appendUserToReqIfTokenExist, async (req, res) => {
    const { orderTrackingId } = req.params;
    if (!pesapalPaymentInstance) {
        return res.status(403).send({ success: false, err: 'missing some info' });
    }
    const response = await pesapalPaymentInstance.getTransactionStatus(orderTrackingId);
    if (response.success) {
        const resp = await updateInvoicerelatedStatus(res, orderTrackingId);
        return res.status(200).send({ success: resp.success });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(403).send({ success: response.success, err: response.err });
});
paymentRoutes.get('/subscriptiopaystatus/:orderTrackingId/:subscriptionId', async (req, res) => {
    const { orderTrackingId } = req.params;
    if (!pesapalPaymentInstance) {
        return res.status(403).send({ success: false, err: 'missing some info' });
    }
    const response = await pesapalPaymentInstance.getTransactionStatus(orderTrackingId);
    if (response.success) {
        const subscription = await companySubscriptionMain.findOne({ subscriptionId: req.params.subscriptionId });
        subscription.active = true;
        subscription.status = 'paid'; // TODO
        await subscription.save();
        // TODO update subscription no invoicerelated
        // const resp = await updateInvoicerelatedStatus(orderTrackingId);
        return res.status(200).send({ success: true });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(403).send({ success: response.success, err: response.err });
});
export const updateInvoicerelatedStatus = async (res, orderTrackingId) => {
    const toUpdate = await invoiceRelatedMain
        .findOne({ pesaPalorderTrackingId: orderTrackingId })
        .lean();
    if (toUpdate) {
        let errResponse;
        await invoiceRelatedMain.updateOne({
            pesaPalorderTrackingId: orderTrackingId
        }, {
            $set: {
                status: 'paid'
            }
        }).catch(err => {
            errResponse = {
                success: false,
                status: 403
            };
            if (err && err.errors) {
                errResponse.err = stringifyMongooseErr(err.errors);
            }
            else {
                errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
            }
            return errResponse;
        });
        if (errResponse) {
            return errResponse;
        }
        addParentToLocals(res, toUpdate._id, paymentMain.collection.collectionName, 'makeTrackEdit');
    }
    return { success: true };
};
export const updateCompanySubStatus = async (res, orderTrackingId) => {
    const toUpdate = await companySubscriptionMain
        .findOne({ pesaPalorderTrackingId: orderTrackingId })
        .lean();
    if (toUpdate) {
        toUpdate.status = 'paid';
        let errResponse;
        await companySubscriptionMain.updateOne({
            pesaPalorderTrackingId: orderTrackingId
        }, {
            $set: {
                status: 'paid'
            }
        }).catch(err => {
            errResponse = {
                success: false,
                status: 403
            };
            if (err && err.errors) {
                errResponse.err = stringifyMongooseErr(err.errors);
            }
            else {
                errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
            }
            return errResponse;
        });
        if (errResponse) {
            return errResponse;
        }
        addParentToLocals(res, toUpdate._id, paymentMain.collection.collectionName, 'makeTrackEdit');
    }
    return { success: true };
};
//# sourceMappingURL=payment.routes.js.map