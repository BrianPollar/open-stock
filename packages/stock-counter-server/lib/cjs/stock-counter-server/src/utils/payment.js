"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackOrder = exports.relegatePesapalPayment = exports.paymentMethodDelegator = exports.payOnDelivery = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const order_model_1 = require("../models/order.model");
const payment_model_1 = require("../models/payment.model");
const invoice_model_1 = require("../models/printables/invoice.model");
const paymentrelated_model_1 = require("../models/printables/paymentrelated/paymentrelated.model");
const receipt_model_1 = require("../models/printables/receipt.model");
const invoicerelated_model_1 = require("../models/printables/related/invoicerelated.model");
const promocode_model_1 = require("../models/promocode.model");
const paymentrelated_1 = require("../routes/paymentrelated/paymentrelated");
const invoice_routes_1 = require("../routes/printables/invoice.routes");
const stock_counter_server_1 = require("../stock-counter-server");
/** Logger for the payment controller */
const paymentControllerLogger = tracer.colorConsole({
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
const payOnDelivery = (res, paymentRelated, invoiceRelated, order, payment, userId, companyId) => {
    order.status = 'pending';
    return appendAll(res, paymentRelated, invoiceRelated, order, payment, userId, companyId, false);
};
exports.payOnDelivery = payOnDelivery;
const appendAll = async (res, paymentRelated, invoiceRelated, order, payment, userId, companyId, paid = true) => {
    paymentControllerLogger.debug('appendAll - userId:', userId);
    const saved = await addOrder(res, paymentRelated, invoiceRelated, order, userId, companyId);
    paymentControllerLogger.error('appendAll - saved:', saved);
    if (saved.success) {
        payment.order = saved.orderId;
        payment.paymentRelated = saved.paymentRelated;
        payment.invoiceRelated = saved.invoiceRelated;
        await addPayment(payment, userId, paid);
        return {
            success: saved.success,
            status: saved.status,
            paymentRelated: saved.paymentRelated, invoiceRelated: saved.invoiceRelated, order: saved.orderId
        };
    }
    else {
        return {
            success: saved.success,
            status: saved.status,
            err: saved.err, paymentRelated: saved.paymentRelated, invoiceRelated: saved.invoiceRelated, order: saved.orderId
        };
    }
};
const addOrder = async (res, paymentRelated, invoiceRelated, order, userId, companyId) => {
    paymentControllerLogger.info('addOrder');
    const extraNotifDesc = 'New Order';
    paymentRelated.orderStatus = 'pending';
    const paymentRelatedId = await (0, paymentrelated_1.relegatePaymentRelatedCreation)(res, paymentRelated, invoiceRelated, 'order', extraNotifDesc, companyId);
    paymentControllerLogger.error('addOrder - paymentRelatedId', paymentRelatedId);
    if (!paymentRelatedId.success) {
        return { success: false, status: 403, paymentRelated: paymentRelatedId._id };
    }
    order.paymentRelated = paymentRelatedId._id;
    const invoice = {
        invoiceRelated: '',
        dueDate: order.deliveryDate
    };
    const payments = invoiceRelated.payments.slice();
    invoiceRelated.payments.length = 0;
    invoiceRelated.payments = [];
    const invoiceRelatedId = await (0, invoice_routes_1.saveInvoice)(res, invoice, invoiceRelated, companyId);
    paymentControllerLogger.error('invoiceRelatedId', invoiceRelatedId);
    if (!invoiceRelatedId.success) {
        return { success: false, status: 403, invoiceRelated: invoiceRelatedId._id };
    }
    order.invoiceRelated = invoiceRelatedId._id;
    if (payments && payments.length) {
        await (0, paymentrelated_1.makePaymentInstall)(res, payments[0], invoiceRelatedId._id, companyId, 'solo');
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
        notification: (0, stock_notif_server_1.makeNotfnBody)(userId, title, notifnBody, 'orders', actions, withId._id),
        filters: {
            orders: true
        }
    };
    // body.options.orders = true; // TODO
    await (0, stock_notif_server_1.createNotifications)(body);
    return {
        success: true,
        status: 200,
        orderId: withId._id,
        paymentRelated: (order).paymentRelated,
        invoiceRelated: invoiceRelatedId._id
    };
};
/**
 * Adds a payment to the database
 * @param payment - The payment information
 * @param userId - The user ID
 * @param paid - Whether the payment has been made
 */
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
            notification: (0, stock_notif_server_1.makeNotfnBody)(userId, title, notifnBody, 'payments', actions, withId._id),
            filters: {
                orders: true
            }
        };
        // body.notification.payments = true; // TODO
        await (0, stock_notif_server_1.createNotifications)(body);
    }
    return true;
};
/**
   * Handles payments based on the payment method.
   * @param res - The response object.
   * @param paymentRelated - The payment related information.
   * @param invoiceRelated - The invoice related information.
   * @param type - The payment method type.
   * @param order - The order information.
   * @param payment - The payment information.
   * @param userId - The user ID.
   * @param companyId - The company ID.
   * @param burgain - The burgain information.
   * @param payType - The payment type ('nonSubscription' or 'subscription').
   * @returns A promise that resolves to an object containing the success status and the payment ID, if successful.
   */
const paymentMethodDelegator = async (res, paymentRelated, invoiceRelated, type, order, payment, userId, companyId, burgain, payType = 'nonSubscription') => {
    paymentRelated.payType = payType;
    invoiceRelated.payType = payType;
    paymentControllerLogger.debug('paymentMethodDelegator: type - ', type);
    if (burgain.state) {
        const bgainCode = await promocode_model_1.promocodeLean
            .findOne({
            code: burgain.code,
            state: 'virgin',
            items: order.items
        }).lean();
        if (bgainCode) {
            let errResponse;
            await promocode_model_1.promocodeMain.updateOne({
                code: burgain.code,
                state: 'virgin',
                items: order.items
            }, { $set: { state: 'inOperation' } }).catch(err => {
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
            response = await (0, exports.relegatePesapalPayment)(res, paymentRelated, invoiceRelated, type, order, payment, userId, companyId);
            break;
        }
        default:
            response = await (0, exports.payOnDelivery)(res, paymentRelated, invoiceRelated, order, payment, userId, companyId);
            break;
    }
    paymentControllerLogger.debug('paymentMethodDelegator - response', response);
    if (burgain.state) {
        const bgainCode = await promocode_model_1.promocodeLean
            .findOne({
            code: burgain.code,
            state: 'inOperation',
            items: order.items
        }).lean();
        let state;
        if (bgainCode) {
            if (response.success) {
                state = 'expired';
            }
            else {
                state = 'virgin';
            }
            await promocode_model_1.promocodeMain.updateOne({
                code: burgain.code,
                state: 'inOperation',
                items: order.items
            }, {
                $set: { state }
            }).catch(err => {
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
const relegatePesapalPayment = async (res, paymentRelated, invoiceRelated, type, order, payment, userId, companyId) => {
    paymentControllerLogger.debug('relegatePesapalPayment', paymentRelated);
    const isValidCompanyId = (0, stock_universal_server_1.verifyObjectId)(paymentRelated.companyId);
    if (isValidCompanyId) {
        const company = await stock_auth_server_1.companyMain.findById(paymentRelated.companyId);
        if (!company) {
            // return { success: false, status: 401, err: 'user must be of a company' };
        }
    }
    const appended = await appendAll(res, paymentRelated, invoiceRelated, order, payment, userId, companyId);
    const payDetails = {
        id: appended.paymentRelated.toString(),
        currency: paymentRelated.currency || 'UGX',
        amount: paymentRelated.payments[0].amount,
        description: 'Complete payments for the selected products',
        callback_url: stock_counter_server_1.pesapalPaymentInstance.config.pesapalCallbackUrl,
        cancellation_url: '',
        notification_id: '',
        billing_address: {
            email_address: paymentRelated.shippingAddress.email,
            phone_number: paymentRelated.shippingAddress.phoneNumber,
            // TODO
            country_code: paymentRelated.shippingAddress.countryCode || 'UG',
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
    paymentControllerLogger.debug('b4 pesapalPaymentInstance.submitOrder', appended.paymentRelated.toString());
    const response = await stock_counter_server_1.pesapalPaymentInstance.submitOrder(payDetails, appended.paymentRelated.toString(), 'Complete product payment');
    if (!response.success) {
        const deteils = {
            paymentRelated: appended.paymentRelated,
            invoiceRelated: appended.invoiceRelated,
            order: appended.order
        };
        await deleteCreatedDocsOnFailure(deteils);
        return response;
    }
    paymentControllerLogger.debug('pesapalPaymentInstance.submitOrder', response);
    const isValid = (0, stock_universal_server_1.verifyObjectId)(appended.paymentRelated.toString());
    if (!isValid) {
        return { success: false, status: 401, pesapalOrderRes: null, paymentRelated: null };
    }
    const related = await paymentrelated_model_1.paymentRelatedMain.findById(appended.paymentRelated.toString());
    paymentControllerLogger.info('after paymentRelatedMain.findById');
    if (related) {
        related.pesaPalorderTrackingId = response.pesaPalOrderRes.order_tracking_id;
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
    return {
        success: true,
        status: 200,
        pesapalOrderRes: response.pesaPalOrderRes,
        paymentRelated: appended.paymentRelated.toString()
    };
};
exports.relegatePesapalPayment = relegatePesapalPayment;
/**
 * Deletes all created documents on a failed payment creation.
 * @param paymentRelated - The ID of the payment related document created.
 * @param invoiceRelated - The ID of the invoice related document created.
 * @param order - The ID of the order created.
 * @returns A promise that resolves to a boolean indicating the success of the deletion.
 */
const deleteCreatedDocsOnFailure = async ({ paymentRelated, invoiceRelated, order }) => {
    if (invoiceRelated) {
        await invoicerelated_model_1.invoiceRelatedMain.deleteOne({ _id: invoiceRelated });
        await invoice_model_1.invoiceMain.deleteOne({ invoiceRelated });
        await receipt_model_1.receiptMain.deleteOne({ invoiceRelated });
    }
    if (paymentRelated) {
        await paymentrelated_model_1.paymentRelatedMain.deleteOne({ _id: paymentRelated });
        await payment_model_1.paymentMain.deleteOne({ paymentRelated });
    }
    if (order) {
        await order_model_1.orderMain.deleteOne({ _id: order });
    }
    return true;
};
/**
   * Tracks the status of a payment.
   * @param refereceId - The tracking ID of the payment.
   * @returns A promise that resolves to an object containing the success status and the order status.
   */
const trackOrder = async (refereceId) => {
    const paymentRelated = await paymentrelated_model_1.paymentRelatedMain
        .findOne({ pesaPalorderTrackingId: refereceId }).lean();
    if (!paymentRelated) {
        return { success: false };
    }
    return { success: true, orderStatus: paymentRelated.orderStatus };
};
exports.trackOrder = trackOrder;
//# sourceMappingURL=payment.js.map