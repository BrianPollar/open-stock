"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanySubStatus = exports.updateInvoicerelatedStatus = exports.paymentRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
/**
 * Express routes for payment related operations.
 * @remarks
 * This file contains the implementation of the payment routes for the stock-counter-server application.
 * The payment routes include creating a payment, updating a payment, and getting a payment by ID.
 * @packageDocumentation
 */
const express_1 = tslib_1.__importDefault(require("express"));
const payment_model_1 = require("../models/payment.model");
const paymentrelated_model_1 = require("../models/printables/paymentrelated/paymentrelated.model");
// import { paymentInstallsLean } from '../models/printables/paymentrelated/paymentsinstalls.model';
const invoicerelated_model_1 = require("../models/printables/related/invoicerelated.model");
const paymentrelated_1 = require("./paymentrelated/paymentrelated");
// import * as url from 'url';
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_2 = require("@open-stock/stock-universal-server");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const stock_counter_server_1 = require("../stock-counter-server");
const query_1 = require("../utils/query");
const invoicerelated_1 = require("./printables/related/invoicerelated");
const paymentRoutesLogger = tracer.colorConsole({
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
exports.paymentRoutes = express_1.default.Router();
/** paymentRoutes
 * .post('/braintreeclenttoken', requireAuth, async (req: IcustomRequest<never, unknown>, res) => {
  const token = await brainTreeInstance.generateToken();
  return res.status(200).send({ token, success: true });
});**/
exports.paymentRoutes.post('/add', stock_universal_server_2.requireAuth, async (req, res) => {
    let { payment } = req.body;
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const isValid = (0, stock_universal_server_2.verifyObjectId)(filter.companyId);
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
    const paymentRelatedRes = await (0, paymentrelated_1.relegatePaymentRelatedCreation)(res, paymentRelated, invoiceRelated, 'order', extraNotifDesc, filter.companyId);
    if (!paymentRelatedRes.success) {
        return res.status(paymentRelatedRes.status).send(paymentRelatedRes);
    }
    payment.paymentRelated = paymentRelatedRes._id;
    const payments = invoiceRelated.payments.slice();
    invoiceRelated.payments.length = 0;
    invoiceRelated.payments = [];
    const invoiceRelatedRes = await (0, invoicerelated_1.relegateInvRelatedCreation)(res, invoiceRelated, filter.companyId, extraNotifDesc, true);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    payment.invoiceRelated = invoiceRelatedRes._id;
    if (payments && payments.length) {
        await (0, paymentrelated_1.makePaymentInstall)(res, payments[0], invoiceRelatedRes._id, filter.companyId, invoiceRelated.creationType);
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
            errResponse.err = (0, stock_universal_server_2.stringifyMongooseErr)(err.errors);
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
        (0, stock_universal_server_2.addParentToLocals)(res, saved._id, payment_model_1.paymentMain.collection.collectionName, 'makeTrackEdit');
    }
    return res.status(200).send({ success: Boolean(saved) });
});
exports.paymentRoutes.put('/update', stock_universal_server_2.requireAuth, async (req, res) => {
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const { updatedPayment, paymentRelated } = req.body;
    updatedPayment.companyId = filter.companyId;
    paymentRelated.companyId = filter.companyId;
    const { _id } = updatedPayment;
    const isValid = (0, stock_universal_server_2.verifyObjectIds)([_id, filter.companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const payment = await payment_model_1.paymentMain
        .findOne({ _id, ...filter })
        .lean();
    if (!payment) {
        return res.status(404).send({ success: false });
    }
    await (0, paymentrelated_1.updatePaymentRelated)(paymentRelated, filter.companyId);
    let errResponse;
    const updated = await payment_model_1.paymentMain.updateOne({
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
            errResponse.err = (0, stock_universal_server_2.stringifyMongooseErr)(err.errors);
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
    (0, stock_universal_server_2.addParentToLocals)(res, _id, payment_model_1.paymentMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
});
exports.paymentRoutes.get('/one/:_id', stock_universal_server_2.requireAuth, async (req, res) => {
    const { _id } = req.params;
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const payment = await payment_model_1.paymentLean
        .findOne({ _id, ...filter })
        .lean()
        .populate([(0, query_1.populatePaymentRelated)(), (0, query_1.populateInvoiceRelated)(true), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]);
    if (!payment) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const returned = (0, paymentrelated_1.makePaymentRelatedPdct)(payment.paymentRelated, payment.invoiceRelated, payment.invoiceRelated
        .billingUserId, payment);
    (0, stock_universal_server_2.addParentToLocals)(res, payment._id, payment_model_1.paymentMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(returned);
});
exports.paymentRoutes.get('/all/:offset/:limit', stock_universal_server_2.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_2.roleAuthorisation)('payments', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_2.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        payment_model_1.paymentLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .lean()
            .populate([(0, query_1.populatePaymentRelated)(), (0, query_1.populateInvoiceRelated)(true), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        payment_model_1.paymentLean.countDocuments(filter)
    ]);
    const returned = all[0]
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count: all[1],
        data: returned
    };
    for (const val of returned) {
        (0, stock_universal_server_2.addParentToLocals)(res, val._id, payment_model_1.paymentMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.paymentRoutes.get('/getmypayments/:offset/:limit', stock_universal_server_2.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const isValid = (0, stock_universal_server_2.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        payment_model_1.paymentLean
            .find({ user: userId, ...(0, stock_universal_server_1.makePredomFilter)(req) })
            .lean()
            .populate([(0, query_1.populatePaymentRelated)(), (0, query_1.populateInvoiceRelated)(true), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()]),
        payment_model_1.paymentLean.countDocuments({ user: userId, ...(0, stock_universal_server_1.makePredomFilter)(req) })
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
exports.paymentRoutes.put('/delete/one', stock_universal_server_2.requireAuth, stock_auth_server_1.requireSuperAdmin, async (req, res) => {
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const { _id } = req.body;
    const found = await payment_model_1.paymentLean.findOne({ _id });
    if (!found) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    const deleted = await (0, paymentrelated_1.deleteAllPayOrderLinked)(found.paymentRelated, found.invoiceRelated, 'payment', filter.companyId);
    // await paymentMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        (0, stock_universal_server_2.addParentToLocals)(res, _id, payment_model_1.paymentMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.paymentRoutes.post('/filter', stock_universal_server_2.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_2.roleAuthorisation)('payments', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_2.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = payment_model_1.paymentLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldInvoiceRelatedFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), propSort, offset, limit)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const returned = all
        .map(val => (0, paymentrelated_1.makePaymentRelatedPdct)(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    const response = {
        count,
        data: returned
    };
    for (const val of all) {
        (0, stock_universal_server_2.addParentToLocals)(res, val._id, payment_model_1.paymentMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.paymentRoutes.put('/delete/many', stock_universal_server_2.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_2.roleAuthorisation)('payments', 'delete'), async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_2.makeCompanyBasedQuery)(req);
    const promises = _ids
        .map(async (_id) => {
        const found = await payment_model_1.paymentLean.findOne({ _id });
        if (found) {
            await (0, paymentrelated_1.deleteAllPayOrderLinked)(found.paymentRelated, found.invoiceRelated, 'payment', filter.companyId);
        }
        return new Promise(resolve => resolve(found._id));
    });
    const filterdExist = await Promise.all(promises);
    for (const val of filterdExist) {
        (0, stock_universal_server_2.addParentToLocals)(res, val, payment_model_1.paymentMain.collection.collectionName, 'trackDataDelete');
    }
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
    const companySub = await stock_auth_server_1.companySubscriptionLean.findOne({ pesaPalorderTrackingId: orderTrackingId }).lean();
    if (companySub) {
        await (0, exports.updateCompanySubStatus)(res, orderTrackingId);
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
    const related = await paymentrelated_model_1.paymentRelatedLean.findOne({ pesaPalorderTrackingId: orderTrackingId }).lean();
    if (!stock_counter_server_1.pesapalPaymentInstance && !related) {
        return res.status(500).send({ success: false, err: 'internal server error' });
    }
    // return relegatePesaPalNotifications(orderTrackingId, orderNotificationType, orderMerchantReference);
    const response = await stock_counter_server_1.pesapalPaymentInstance.getTransactionStatus(orderTrackingId);
    if (response.success) {
        await (0, exports.updateInvoicerelatedStatus)(res, orderTrackingId);
    }
    return response;
});
exports.paymentRoutes.get('/paymentstatus/:orderTrackingId/:paymentRelated', stock_universal_server_1.appendUserToReqIfTokenExist, async (req, res) => {
    const { orderTrackingId } = req.params;
    if (!stock_counter_server_1.pesapalPaymentInstance) {
        return res.status(403).send({ success: false, err: 'missing some info' });
    }
    const response = await stock_counter_server_1.pesapalPaymentInstance.getTransactionStatus(orderTrackingId);
    if (response.success) {
        const resp = await (0, exports.updateInvoicerelatedStatus)(res, orderTrackingId);
        return res.status(200).send({ success: resp.success });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(403).send({ success: response.success, err: response.err });
});
exports.paymentRoutes.get('/subscriptiopaystatus/:orderTrackingId/:subscriptionId', async (req, res) => {
    const { orderTrackingId } = req.params;
    if (!stock_counter_server_1.pesapalPaymentInstance) {
        return res.status(403).send({ success: false, err: 'missing some info' });
    }
    const response = await stock_counter_server_1.pesapalPaymentInstance.getTransactionStatus(orderTrackingId);
    if (response.success) {
        const subscription = await stock_auth_server_1.companySubscriptionMain.findOne({ subscriptionId: req.params.subscriptionId });
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
const updateInvoicerelatedStatus = async (res, orderTrackingId) => {
    const toUpdate = await invoicerelated_model_1.invoiceRelatedMain
        .findOne({ pesaPalorderTrackingId: orderTrackingId })
        .lean();
    if (toUpdate) {
        let errResponse;
        await invoicerelated_model_1.invoiceRelatedMain.updateOne({
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
                errResponse.err = (0, stock_universal_server_2.stringifyMongooseErr)(err.errors);
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
        (0, stock_universal_server_2.addParentToLocals)(res, toUpdate._id, payment_model_1.paymentMain.collection.collectionName, 'makeTrackEdit');
    }
    return { success: true };
};
exports.updateInvoicerelatedStatus = updateInvoicerelatedStatus;
const updateCompanySubStatus = async (res, orderTrackingId) => {
    const toUpdate = await stock_auth_server_1.companySubscriptionMain
        .findOne({ pesaPalorderTrackingId: orderTrackingId })
        .lean();
    if (toUpdate) {
        toUpdate.status = 'paid';
        let errResponse;
        await stock_auth_server_1.companySubscriptionMain.updateOne({
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
                errResponse.err = (0, stock_universal_server_2.stringifyMongooseErr)(err.errors);
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
        (0, stock_universal_server_2.addParentToLocals)(res, toUpdate._id, payment_model_1.paymentMain.collection.collectionName, 'makeTrackEdit');
    }
    return { success: true };
};
exports.updateCompanySubStatus = updateCompanySubStatus;
//# sourceMappingURL=payment.routes.js.map