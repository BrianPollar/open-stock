/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { paymentLean, paymentMain } from '../models/payment.model';
import { paymentRelatedLean } from '../models/printables/paymentrelated/paymentrelated.model';
// import { paymentInstallsLean } from '../models/printables/paymentrelated/paymentsinstalls.model';
import { invoiceRelatedLean, invoiceRelatedMain } from '../models/printables/related/invoicerelated.model';
import { itemLean } from '../models/item.model';
import { deleteAllPayOrderLinked, makePaymentInstall, makePaymentRelatedPdct, relegatePaymentRelatedCreation, updatePaymentRelated } from './paymentrelated/paymentrelated';
// import * as url from 'url';
import { getLogger } from 'log4js';
import { relegateInvRelatedCreation } from './printables/related/invoicerelated';
import { offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId } from '@open-stock/stock-universal-server';
import { userLean } from '@open-stock/stock-auth-server';
import { pesapalPaymentInstance } from '../stock-counter-server';
import { receiptLean } from '../models/printables/receipt.model';
/** */
const paymentRoutesLogger = getLogger('routes/paymentRoutes');
/** */
export const paymentRoutes = express.Router();
/** paymentRoutes.post('/braintreeclenttoken', requireAuth, async (req, res) => {
  const token = await brainTreeInstance.generateToken();
  return res.status(200).send({ token, success: true });
});**/
paymentRoutes.post('/create', requireAuth, async (req, res) => {
    let { payment } = req.body;
    const { paymentRelated, invoiceRelated } = req.body;
    if (!payment) {
        payment = {
            paymentRelated: ''
        };
    }
    const extraNotifDesc = 'Newly created order';
    const paymentRelatedRes = await relegatePaymentRelatedCreation(paymentRelated, invoiceRelated, 'order', extraNotifDesc, req.app.locals.stockCounterServer.notifRedirectUrl);
    console.log('77777777', paymentRelatedRes);
    if (!paymentRelatedRes.success) {
        return res.status(paymentRelatedRes.status).send(paymentRelatedRes);
    }
    payment.paymentRelated = paymentRelatedRes.id;
    const payments = invoiceRelated.payments.slice();
    invoiceRelated.payments.length = 0;
    invoiceRelated.payments = [];
    const invoiceRelatedRes = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, req.app.locals.stockCounterServer.notifRedirectUrl, req.app.locals.stockCounterServer.locaLMailHandler, true);
    console.log('9999999999', invoiceRelatedRes);
    if (!invoiceRelatedRes.success) {
        return res.status(invoiceRelatedRes.status).send(invoiceRelatedRes);
    }
    payment.invoiceRelated = invoiceRelatedRes.id;
    if (payments && payments.length) {
        await makePaymentInstall(payments, invoiceRelatedRes.id);
    }
    const newPaymt = new paymentMain(payment);
    let errResponse;
    const saved = await newPaymt.save()
        .catch(err => {
        console.log('this is ERROR SHIT', err);
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
paymentRoutes.put('/update', requireAuth, async (req, res) => {
    const { updatedPayment, paymentRelated } = req.body;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedPayment;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const payment = await paymentMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!payment) {
        return res.status(404).send({ success: false });
    }
    payment.order = updatedPayment.order || payment.order;
    await updatePaymentRelated(paymentRelated);
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
paymentRoutes.get('/getone/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const payment = await paymentLean
        .findById(id)
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
                path: 'items.item', model: itemLean
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
paymentRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('payments'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const payments = await paymentLean
        .find({})
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
                path: 'items.item', model: itemLean
            }]
    });
    const returned = payments
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    return res.status(200).send(returned);
});
paymentRoutes.get('/getmypayments', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const payments = await paymentLean
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
                path: 'items.item', model: itemLean
            }]
    });
    const returned = payments
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    return res.status(200).send(returned);
});
paymentRoutes.put('/deleteone', requireAuth, async (req, res) => {
    const { id, paymentRelated, invoiceRelated, creationType, where } = req.body;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deleteAllPayOrderLinked(paymentRelated, invoiceRelated, creationType, where);
    // await paymentMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
paymentRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('payments'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const payments = await paymentLean
        .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
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
                path: 'items.item', model: itemLean
            }]
    });
    const returned = payments
        .map(val => makePaymentRelatedPdct(val.paymentRelated, val.invoiceRelated, val.invoiceRelated
        .billingUserId, val));
    return res.status(200).send(returned);
});
paymentRoutes.put('/deletemany', requireAuth, roleAuthorisation('payments'), async (req, res) => {
    const { credentials } = req.body;
    if (!credentials || credentials?.length < 1) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    /** await paymentMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .deleteMany({ _id: { $in: ids } });**/
    const promises = credentials
        .map(async (val) => {
        await deleteAllPayOrderLinked(val.paymentRelated, val.invoiceRelated, val.creationType, val.where);
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
        await updateInvoicerelatedStatus(orderTrackingId);
    }
    return response;
});
/** */
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
//# sourceMappingURL=payment.routes.js.map