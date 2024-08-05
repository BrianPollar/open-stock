/**
 * Express routes for payment related operations.
 * @remarks
 * This file contains the implementation of the payment routes for the stock-counter-server application.
 * The payment routes include creating a payment, updating a payment, and getting a payment by ID.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { paymentLean, paymentMain } from '../models/payment.model';
import { paymentRelatedLean } from '../models/printables/paymentrelated/paymentrelated.model';
// import { paymentInstallsLean } from '../models/printables/paymentrelated/paymentsinstalls.model';
import { itemLean } from '../models/item.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../models/printables/related/invoicerelated.model';
import { deleteAllPayOrderLinked, makePaymentInstall, makePaymentRelatedPdct, relegatePaymentRelatedCreation, updatePaymentRelated } from './paymentrelated/paymentrelated';
// import * as url from 'url';
import { companySubscriptionLean, companySubscriptionMain, requireActiveCompany, requireSuperAdmin, userLean } from '@open-stock/stock-auth-server';
import { fileMetaLean, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { receiptLean } from '../models/printables/receipt.model';
import { pesapalPaymentInstance } from '../stock-counter-server';
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
/** paymentRoutes.post('/braintreeclenttoken/:companyIdParam', requireAuth, async (req, res) => {
  const token = await brainTreeInstance.generateToken();
  return res.status(200).send({ token, success: true });
});**/
paymentRoutes.post('/create/:companyIdParam', requireAuth, async (req, res) => {
    let { payment } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    payment.companyId = queryId;
    const { paymentRelated, invoiceRelated } = req.body;
    if (!payment) {
        payment = {
            paymentRelated: ''
        };
    }
    const extraNotifDesc = 'Newly created order';
    const paymentRelatedRes = await relegatePaymentRelatedCreation(paymentRelated, invoiceRelated, 'order', extraNotifDesc, queryId);
    if (!paymentRelatedRes.success) {
        return res.status(paymentRelatedRes.status).send(paymentRelatedRes);
    }
    payment.paymentRelated = paymentRelatedRes.id;
    const payments = invoiceRelated.payments.slice();
    invoiceRelated.payments.length = 0;
    invoiceRelated.payments = [];
    const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated, companyId, extraNotifDesc, true);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    payment.invoiceRelated = invoiceRelatedRes.id;
    if (payments && payments.length) {
        await makePaymentInstall(payments, invoiceRelatedRes.id, queryId, invoiceRelated.creationType);
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
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    return res.status(200).send({ success: Boolean(saved) });
});
paymentRoutes.put('/update/:companyIdParam', requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { updatedPayment, paymentRelated } = req.body;
    updatedPayment.companyId = queryId;
    paymentRelated.companyId = queryId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedPayment;
    const isValid = verifyObjectIds([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const payment = await paymentMain
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!payment) {
        return res.status(404).send({ success: false });
    }
    payment.order = updatedPayment.order || payment.order;
    await updatePaymentRelated(paymentRelated, queryId);
    let errResponse;
    const updated = await payment.save()
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
    return res.status(200).send({ success: Boolean(updated) });
});
paymentRoutes.get('/getone/:id/:companyIdParam', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const payment = await paymentLean
        .findOne({ _id: id, companyId: queryId })
        .lean()
        .populate({ path: 'paymentRelated', model: paymentRelatedLean })
        .populate({
        path: 'invoiceRelated', model: invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: userLean
            },
            {
                path: 'payments', model: receiptLean
            },
            {
                path: 'items.item', model: itemLean,
                populate: [{
                        path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }]
            }
        ]
    });
    let returned;
    if (payment) {
        returned = makePaymentRelatedPdct(payment.paymentRelated, payment.invoiceRelated, payment.invoiceRelated
            .billingUserId, payment);
    }
    return res.status(200).send(returned);
});
paymentRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('payments', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        paymentLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'paymentRelated', model: paymentRelatedLean })
            .populate({
            path: 'invoiceRelated', model: invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: userLean
                },
                {
                    path: 'payments', model: receiptLean
                },
                {
                    path: 'items.item', model: itemLean,
                    populate: [{
                            path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }]
                }]
        }),
        paymentLean.countDocuments({ companyId: queryId })
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
paymentRoutes.get('/getmypayments/:offset/:limit/:companyIdParam', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const isValid = verifyObjectId(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        paymentLean
            .find({ user: userId })
            .lean()
            .populate({ path: 'paymentRelated', model: paymentRelatedLean })
            .populate({
            path: 'invoiceRelated', model: invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: userLean
                },
                {
                    path: 'payments', model: receiptLean
                },
                {
                    path: 'items.item', model: itemLean,
                    populate: [{
                            path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }]
                }]
        }),
        paymentLean.countDocuments({ user: userId })
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
paymentRoutes.put('/deleteone/:companyIdParam', requireAuth, requireSuperAdmin, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { id, paymentRelated, invoiceRelated, creationType, where } = req.body;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllPayOrderLinked(paymentRelated, invoiceRelated, creationType, where, queryId);
    // await paymentMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
paymentRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('payments', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        paymentLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .lean()
            .skip(offset)
            .limit(limit)
            .populate({ path: 'paymentRelated', model: itemLean })
            .populate({
            path: 'invoiceRelated', model: invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: userLean
                },
                {
                    path: 'payments', model: receiptLean
                },
                {
                    path: 'items.item', model: itemLean,
                    populate: [{
                            path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }]
                }]
        }),
        paymentLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
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
paymentRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('payments', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await paymentMain
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await deleteAllPayOrderLinked(val.paymentRelated, val.invoiceRelated, val.creationType, val.where, queryId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
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
        await updateCompanySubStatus(orderTrackingId);
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
        await updateInvoicerelatedStatus(orderTrackingId);
    }
    return response;
});
paymentRoutes.get('/paymentstatus/:orderTrackingId/:paymentRelated', async (req, res) => {
    const { orderTrackingId } = req.params;
    if (!pesapalPaymentInstance) {
        return res.status(403).send({ success: false, err: 'missing some info' });
    }
    const response = await pesapalPaymentInstance.getTransactionStatus(orderTrackingId);
    if (response.success) {
        const resp = await updateInvoicerelatedStatus(orderTrackingId);
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
export const updateInvoicerelatedStatus = async (orderTrackingId) => {
    const toUpdate = await invoiceRelatedMain
        .findOneAndUpdate({ pesaPalorderTrackingId: orderTrackingId });
    if (toUpdate) {
        toUpdate.status = 'paid';
        let errResponse;
        await toUpdate.save().catch(err => {
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
    }
    return { success: true };
};
export const updateCompanySubStatus = async (orderTrackingId) => {
    const toUpdate = await companySubscriptionMain
        .findOneAndUpdate({ pesaPalorderTrackingId: orderTrackingId });
    if (toUpdate) {
        toUpdate.status = 'paid';
        let errResponse;
        await toUpdate.save().catch(err => {
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
    }
    return { success: true };
};
//# sourceMappingURL=payment.routes.js.map