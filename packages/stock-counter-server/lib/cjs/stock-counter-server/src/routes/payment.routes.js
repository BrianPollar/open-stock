"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoicerelatedStatus = exports.paymentRoutes = void 0;
const tslib_1 = require("tslib");
/**
 * Express routes for payment related operations.
 * @remarks
 * This file contains the implementation of the payment routes for the stock-counter-server application.
 * The payment routes include creating a payment, updating a payment, and getting a payment by ID.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const payment_model_1 = require("../models/payment.model");
const paymentrelated_model_1 = require("../models/printables/paymentrelated/paymentrelated.model");
// import { paymentInstallsLean } from '../models/printables/paymentrelated/paymentsinstalls.model';
const item_model_1 = require("../models/item.model");
const invoicerelated_model_1 = require("../models/printables/related/invoicerelated.model");
const paymentrelated_1 = require("./paymentrelated/paymentrelated");
// import * as url from 'url';
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const log4js_1 = require("log4js");
const receipt_model_1 = require("../models/printables/receipt.model");
const stock_counter_server_1 = require("../stock-counter-server");
const invoicerelated_1 = require("./printables/related/invoicerelated");
const paymentRoutesLogger = (0, log4js_1.getLogger)('routes/paymentRoutes');
/**
 * Express router for payment routes.
 */
exports.paymentRoutes = express_1.default.Router();
/** paymentRoutes.post('/braintreeclenttoken/:companyIdParam', requireAuth, async (req, res) => {
  const token = await brainTreeInstance.generateToken();
  return res.status(200).send({ token, success: true });
});**/
exports.paymentRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    let { payment } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
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
    const paymentRelatedRes = await (0, paymentrelated_1.relegatePaymentRelatedCreation)(paymentRelated, invoiceRelated, 'order', extraNotifDesc, queryId);
    if (!paymentRelatedRes.success) {
        return res.status(paymentRelatedRes.status).send(paymentRelatedRes);
    }
    payment.paymentRelated = paymentRelatedRes.id;
    const payments = invoiceRelated.payments.slice();
    invoiceRelated.payments.length = 0;
    invoiceRelated.payments = [];
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(invoiceRelated, companyId, extraNotifDesc, true);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    payment.invoiceRelated = invoiceRelatedRes.id;
    if (payments && payments.length) {
        await (0, paymentrelated_1.makePaymentInstall)(payments, invoiceRelatedRes.id, queryId);
    }
    const newPaymt = new payment_model_1.paymentMain(payment);
    let errResponse;
    const saved = await newPaymt.save()
        .catch(err => {
        paymentRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.paymentRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { updatedPayment, paymentRelated } = req.body;
    updatedPayment.companyId = queryId;
    paymentRelated.companyId = queryId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedPayment;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const payment = await payment_model_1.paymentMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!payment) {
        return res.status(404).send({ success: false });
    }
    payment.order = updatedPayment.order || payment.order;
    await (0, paymentrelated_1.updatePaymentRelated)(paymentRelated, queryId);
    let errResponse;
    const updated = await payment.save()
        .catch(err => {
        paymentRoutesLogger.info('update - err', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.paymentRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const payment = await payment_model_1.paymentLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
        .lean()
        .populate({ path: 'paymentRelated', model: paymentrelated_model_1.paymentRelatedLean })
        .populate({
        path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
        populate: [{
                path: 'billingUserId', model: stock_auth_server_1.userLean
            },
            {
                path: 'payments', model: receipt_model_1.receiptLean
            },
            {
                path: 'items.item', model: item_model_1.itemLean,
                populate: [{
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                    }]
            }
        ]
    });
    let returned;
    if (payment) {
        returned = (0, paymentrelated_1.makePaymentRelatedPdct)(payment.paymentRelated, payment.invoiceRelated, payment.invoiceRelated
            .billingUserId, payment);
    }
    return res.status(200).send(returned);
});
exports.paymentRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('payments', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        payment_model_1.paymentLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean()
            .populate({ path: 'paymentRelated', model: paymentrelated_model_1.paymentRelatedLean })
            .populate({
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                },
                {
                    path: 'items.item', model: item_model_1.itemLean,
                    populate: [{
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }]
                }]
        }),
        payment_model_1.paymentLean.countDocuments({ companyId: queryId })
    ]);
    const returned = all[0]
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
exports.paymentRoutes.get('/getmypayments/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        payment_model_1.paymentLean
            .find({ user: userId, companyId: queryId })
            .lean()
            .populate({ path: 'paymentRelated', model: paymentrelated_model_1.paymentRelatedLean })
            .populate({
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                },
                {
                    path: 'items.item', model: item_model_1.itemLean,
                    populate: [{
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }]
                }]
        }),
        payment_model_1.paymentLean.countDocuments({ user: userId, companyId: queryId })
    ]);
    const returned = all[0]
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
exports.paymentRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { id, paymentRelated, invoiceRelated, creationType, where } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await (0, paymentrelated_1.deleteAllPayOrderLinked)(paymentRelated, invoiceRelated, creationType, where, queryId);
    // await paymentMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.paymentRoutes.post('/search/:limit/:offset/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('payments', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        payment_model_1.paymentLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .lean()
            .skip(offset)
            .limit(limit)
            .populate({ path: 'paymentRelated', model: item_model_1.itemLean })
            .populate({
            path: 'invoiceRelated', model: invoicerelated_model_1.invoiceRelatedLean,
            populate: [{
                    path: 'billingUserId', model: stock_auth_server_1.userLean
                },
                {
                    path: 'payments', model: receipt_model_1.receiptLean
                },
                {
                    path: 'items.item', model: item_model_1.itemLean,
                    populate: [{
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                        }]
                }]
        }),
        payment_model_1.paymentLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const returned = all[0]
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count: all[1],
        data: returned
    };
    return res.status(200).send(response);
});
exports.paymentRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('payments', 'delete'), async (req, res) => {
    const { credentials } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await paymentMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await (0, paymentrelated_1.deleteAllPayOrderLinked)(val.paymentRelated, val.invoiceRelated, val.creationType, val.where, queryId);
        return new Promise(resolve => resolve(true));
    });
    await Promise.all(promises);
    return res.status(200).send({ success: true });
});
// get ipn
exports.paymentRoutes.get('/ipn', async (req, res) => {
    const currntUrl = new URL(req.url);
    // get access to URLSearchParams object
    const searchParams = currntUrl.searchParams;
    // get url parameters
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const orderNotificationType = searchParams.get('OrderNotificationType');
    const orderMerchantReference = searchParams.get('OrderMerchantReference');
    paymentRoutesLogger.info('ipn - searchParams, %orderTrackingId:, %orderNotificationType:, %orderMerchantReference:', orderTrackingId, orderNotificationType, orderMerchantReference);
    const related = await paymentrelated_model_1.paymentRelatedLean.findOne({ pesaPalorderTrackingId: orderTrackingId }).lean();
    if (!stock_counter_server_1.pesapalPaymentInstance && !related) {
        return res.status(500).send({ success: false, err: 'internal server error' });
    }
    // return relegatePesaPalNotifications(orderTrackingId, orderNotificationType, orderMerchantReference);
    const response = await stock_counter_server_1.pesapalPaymentInstance.getTransactionStatus(orderTrackingId);
    if (response.success) {
        await (0, exports.updateInvoicerelatedStatus)(orderTrackingId);
    }
    return response;
});
exports.paymentRoutes.get('/paymentstatus/:orderTrackingId/:paymentRelated', async (req, res) => {
    const { orderTrackingId } = req.params;
    if (!stock_counter_server_1.pesapalPaymentInstance) {
        return res.status(403).send({ success: false, err: 'missing some info' });
    }
    const response = await stock_counter_server_1.pesapalPaymentInstance.getTransactionStatus(orderTrackingId);
    if (response.success) {
        await (0, exports.updateInvoicerelatedStatus)(orderTrackingId);
    }
    return response;
});
const updateInvoicerelatedStatus = async (orderTrackingId) => {
    const toUpdate = await invoicerelated_model_1.invoiceRelatedMain
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
                errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
exports.updateInvoicerelatedStatus = updateInvoicerelatedStatus;
//# sourceMappingURL=payment.routes.js.map