"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relegatePesaPalNotifications = exports.relegatePesapalPayment = exports.paymentMethodDelegator = exports.payOnDelivery = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */
const log4js_1 = require("log4js");
const order_model_1 = require("../models/order.model");
const payment_model_1 = require("../models/payment.model");
// import Collections from 'mtn-momo/lib/collections';
// import got from 'got';
// const got;
// const got: any = null;
const promocode_model_1 = require("../models/promocode.model");
const paymentrelated_1 = require("../routes/paymentrelated/paymentrelated");
const invoice_routes_1 = require("../routes/printables/invoice.routes");
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const paymentrelated_model_1 = require("../models/printables/paymentrelated/paymentrelated.model");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
/** */
const paymentControllerLogger = (0, log4js_1.getLogger)('paymentController');
/** */
const payOnDelivery = async (paymentRelated, invoiceRelated, order, payment, userId, notifRedirectUrl, locaLMailHandler) => {
    order.status = 'pending';
    return appendAll(paymentRelated, invoiceRelated, order, payment, userId, notifRedirectUrl, locaLMailHandler, false);
};
exports.payOnDelivery = payOnDelivery;
/** */
const appendAll = async (paymentRelated, invoiceRelated, order, payment, userId, notifRedirectUrl, locaLMailHandler, paid = true) => {
    paymentControllerLogger.debug('appendAll - userId:', userId);
    const saved = await addOrder(paymentRelated, invoiceRelated, order, userId, notifRedirectUrl, locaLMailHandler);
    paymentControllerLogger.error('appendAll - saved:', saved);
    if (saved.success) {
        payment.order = saved._id;
        payment.paymentRelated = saved.paymentRelated;
        payment.invoiceRelated = saved.invoiceRelated;
        await addPayment(payment, userId, paid);
        return { success: saved.success, status: saved.status, paymentRelated: saved.paymentRelated };
    }
    else {
        return { success: saved.success, status: saved.status, err: saved.err };
    }
};
/** */
const addOrder = async (paymentRelated, invoiceRelated, order, userId, notifRedirectUrl, locaLMailHandler) => {
    paymentControllerLogger.info('addOrder');
    const extraNotifDesc = 'New Order';
    const paymentRelatedId = await (0, paymentrelated_1.relegatePaymentRelatedCreation)(paymentRelated, invoiceRelated, 'order', extraNotifDesc, notifRedirectUrl);
    paymentControllerLogger.error('addOrder - paymentRelatedId', paymentRelatedId);
    if (!paymentRelatedId.success) {
        return paymentRelatedId;
    }
    order.paymentRelated = paymentRelatedId.id;
    // (order as any).invoiceRelated = relatedId.invoiceRelated;
    const invoice = {
        invoiceRelated: '',
        dueDate: order.deliveryDate
    };
    const payments = invoiceRelated.payments.slice();
    invoiceRelated.payments.length = 0;
    invoiceRelated.payments = [];
    const invoiceRelatedId = await (0, invoice_routes_1.saveInvoice)(invoice, invoiceRelated, notifRedirectUrl, locaLMailHandler);
    paymentControllerLogger.error('invoiceRelatedId', invoiceRelatedId);
    if (!invoiceRelatedId.success) {
        return invoiceRelatedId;
    }
    order.invoiceRelated = invoiceRelatedId.id;
    if (payments && payments.length) {
        await (0, paymentrelated_1.makePaymentInstall)(payments, invoiceRelatedId.id);
    }
    let errResponse;
    const newOrder = new order_model_1.orderMain(order);
    const withId = await newOrder.save().catch(err => {
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
        return {
            status: 403,
            ...errResponse
        };
    }
    const title = 'New Order';
    const notifnBody = 'Request for item made';
    const actions = [
        {
            action: 'view',
            title: 'See Order',
            operation: '',
            url: `order/${withId._id}`
        }
    ];
    const body = {
        options: (0, stock_notif_server_1.makeNotfnBody)(userId, title, notifnBody, 'orders', actions, withId._id),
        filters: {
            orders: true
        }
    };
    body.options.orders = true;
    await (0, stock_notif_server_1.createNotifications)(body);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { success: true, status: 200, _id: withId._id, paymentRelated: (order).paymentRelated, invoiceRelated: invoiceRelatedId };
};
/** */
const addPayment = async (payment, userId, paid = false) => {
    paymentControllerLogger.info('addPayment');
    let errResponse;
    const newProd = new payment_model_1.paymentMain(payment);
    const withId = await newProd.save().catch(err => {
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
        return {
            status: 403,
            ...errResponse
        };
    }
    if (paid) {
        const title = 'New Payment';
        const notifnBody = 'Payment for item made';
        const actions = [
            {
                action: 'view',
                title: 'See Payment',
                operation: '',
                url: `payment/${withId._id}`
            }
        ];
        const body = {
            options: (0, stock_notif_server_1.makeNotfnBody)(userId, title, notifnBody, 'payments', actions, withId._id),
            filters: {
                orders: true
            }
        };
        body.options.payments = true;
        await (0, stock_notif_server_1.createNotifications)(body);
    }
    return true;
};
/** */
const paymentMethodDelegator = async (paymentInstance, paymentRelated, invoiceRelated, type, order, payment, userId, burgain, notifRedirectUrl, locaLMailHandler) => {
    paymentControllerLogger.debug('paymentMethodDelegator: type - ', type);
    if (burgain.state) {
        const bgainCode = await promocode_model_1.promocodeLean
            .findOneAndUpdate({
            code: burgain.code,
            state: 'virgin',
            items: order.items
        });
        if (bgainCode) {
            bgainCode.state = 'inOperation';
            let errResponse;
            await bgainCode.save().catch(err => {
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
                return {
                    success: false,
                    status: 403,
                    errmsg: errResponse.err
                };
            }
            invoiceRelated.payments[0].amount = bgainCode.amount;
            invoiceRelated.payments[0].amount = bgainCode.amount;
            paymentRelated.isBurgain = true;
        }
        else {
            return { success: false, status: 403, errmsg: 'could not complete transaction, wrong promo code' };
        }
    }
    let response;
    switch (type) {
        case 'pesapal': {
            response = await (0, exports.relegatePesapalPayment)(paymentInstance, paymentRelated, invoiceRelated, type, order, payment, userId, burgain, notifRedirectUrl, locaLMailHandler);
            break;
        }
        default:
            response = await (0, exports.payOnDelivery)(paymentRelated, invoiceRelated, order, payment, userId, notifRedirectUrl, locaLMailHandler);
            break;
    }
    paymentControllerLogger.debug('paymentMethodDelegator - response', response);
    if (burgain.state) {
        const bgainCode = await promocode_model_1.promocodeLean
            .findOneAndUpdate({
            code: burgain.code,
            state: 'inOperation',
            items: order.items
        });
        if (bgainCode) {
            if (response.success) {
                bgainCode.state = 'expired';
            }
            else {
                bgainCode.state = 'virgin';
            }
            await bgainCode.save().catch(err => {
                if (err && err.errors) {
                    response.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
                }
                else {
                    response.err = `we are having problems connecting to our databases, 
          try again in a while`;
                }
                return response;
            });
        }
    }
    return response;
};
exports.paymentMethodDelegator = paymentMethodDelegator;
/** */
const relegatePesapalPayment = async (paymentInstance, paymentRelated, invoiceRelated, type, order, payment, userId, burgain, notifRedirectUrl, locaLMailHandler) => {
    const appended = await appendAll(paymentRelated, invoiceRelated, order, payment, userId, notifRedirectUrl, locaLMailHandler);
    const payDetails = {
        id: appended.paymentRelated,
        currency: paymentRelated.currency || 'UGA',
        amount: paymentRelated.payments[0].amount,
        description: 'Complet payments for the selected products',
        callback_url: '',
        notification_id: '',
        billing_address: {
            email_address: paymentRelated.shippingAddress.email,
            phone_number: paymentRelated.shippingAddress.phoneNumber.toString(),
            country_code: 'UG',
            first_name: paymentRelated.shippingAddress.firstName,
            middle_name: '',
            last_name: paymentRelated.shippingAddress.lastName,
            line_1: paymentRelated.shippingAddress.addressLine1,
            line_2: paymentRelated.shippingAddress.addressLine2,
            city: paymentRelated.shippingAddress.city,
            state: paymentRelated.shippingAddress.state,
            // postal_code: paymentRelated.shippingAddress,
            zip_code: paymentRelated.shippingAddress.zipcode.toString()
        }
    };
    const response = await paymentInstance.submitOrder(payDetails, invoiceRelated._id, 'Complete product payment');
    const isValid = (0, stock_universal_server_1.verifyObjectId)(appended.paymentRelated);
    if (!isValid) {
        return { success: false, status: 401, pesapalOrderRes: null, paymentRelated: null };
    }
    const related = await paymentrelated_model_1.paymentRelatedMain.findById(appended.paymentRelated);
    if (related) {
        related.pesaPalorderTrackingId = response.order_tracking_id;
        let errResponse;
        await related.save().catch(err => {
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
            return {
                status: 403,
                ...errResponse
            };
        }
    }
    return { success: true, status: 200, pesapalOrderRes: response, paymentRelated: appended.paymentRelated };
};
exports.relegatePesapalPayment = relegatePesapalPayment;
/**
/** */
const relegatePesaPalNotifications = (orderTrackingId, orderNotificationType, orderMerchantReference) => {
    // TODO make NOTIFS HERE
};
exports.relegatePesaPalNotifications = relegatePesaPalNotifications;
//# sourceMappingURL=payment.controller.js.map