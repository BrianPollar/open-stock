"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackOrder = exports.relegatePesapalPayment = exports.paymentMethodDelegator = exports.payWithWallet = exports.payOnDelivery = void 0;
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const order_model_1 = require("../models/order.model");
const payment_model_1 = require("../models/payment.model");
const invoice_model_1 = require("../models/printables/invoice.model");
const paymentrelated_model_1 = require("../models/printables/paymentrelated/paymentrelated.model");
const receipt_model_1 = require("../models/printables/receipt.model");
const invoicerelated_model_1 = require("../models/printables/related/invoicerelated.model");
const user_wallet_model_1 = require("../models/printables/wallet/user-wallet.model");
const promocode_model_1 = require("../models/promocode.model");
const paymentrelated_1 = require("../routes/paymentrelated/paymentrelated");
const invoice_routes_1 = require("../routes/printables/invoice.routes");
const stock_counter_server_1 = require("../stock-counter-server");
const payOnDelivery = (res, paymentRelated, invoiceRelated, order, payment, userId, companyId) => {
    order.status = 'pending';
    return appendAll(res, paymentRelated, invoiceRelated, order, payment, userId, companyId, false);
};
exports.payOnDelivery = payOnDelivery;
const payWithWallet = async (res, paymentRelated, invoiceRelated, order, payment, userId, companyId) => {
    const userWallet = await user_wallet_model_1.userWalletLean.findOne({ user: userId }).lean();
    if (!userWallet) {
        return { success: false, status: 403, err: 'Insufficient Balance' };
    }
    if (userWallet.accountBalance < invoiceRelated.total) {
        return { success: false, status: 403, err: 'Insufficient Balance' };
    }
    order.status = 'paid';
    const updateRes = await user_wallet_model_1.userWalletMain
        .updateOne({ user: userId }, { $inc: { accountBalance: -invoiceRelated.total } })
        .catch((err) => err);
    if (updateRes instanceof mongoose_1.Error) {
        return { success: false, status: 500, err: 'Could not update user wallet' };
    }
    if (updateRes.modifiedCount === 0) {
        return { success: false, status: 500, err: 'Could not update user wallet' };
    }
    return appendAll(res, paymentRelated, invoiceRelated, order, payment, userId, companyId, true);
};
exports.payWithWallet = payWithWallet;
const appendAll = async (res, paymentRelated, invoiceRelated, order, payment, userId, companyId, paid = true) => {
    stock_universal_server_1.mainLogger.debug('appendAll - userId:', userId);
    const saved = await addOrder(res, paymentRelated, invoiceRelated, order, userId, companyId);
    stock_universal_server_1.mainLogger.error('appendAll - saved:', saved);
    if (saved.success && saved.orderId) {
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
    stock_universal_server_1.mainLogger.info('addOrder');
    const extraNotifDesc = 'New Order';
    paymentRelated.orderStatus = 'pending';
    const paymentRelatedId = await (0, paymentrelated_1.relegatePaymentRelatedCreation)(res, paymentRelated, invoiceRelated, 'order', extraNotifDesc, companyId);
    stock_universal_server_1.mainLogger.error('addOrder - paymentRelatedId', paymentRelatedId);
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
    stock_universal_server_1.mainLogger.error('invoiceRelatedId', invoiceRelatedId);
    if (!invoiceRelatedId.success) {
        return { success: false, status: 403, invoiceRelated: invoiceRelatedId._id };
    }
    order.invoiceRelated = invoiceRelatedId._id;
    if (payments && payments.length && invoiceRelatedId._id) {
        await (0, paymentrelated_1.makePaymentInstall)(res, payments[0], invoiceRelatedId._id, companyId, 'solo');
    }
    const newOrder = new order_model_1.orderMain(order);
    const savedRes = await newOrder.save().catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return errResponse;
    }
    const title = 'New Order';
    const notifnBody = 'Request for item made';
    const actions = [
        {
            action: 'view',
            title: 'See Order',
            operation: '',
            url: `order/${savedRes._id}`
        }
    ];
    const body = {
        notification: (0, stock_notif_server_1.makeNotfnBody)(userId, title, notifnBody, 'orders', actions, savedRes._id),
        filters: {
            orders: true
        }
    };
    // body.options.orders = true; // TODO
    await (0, stock_notif_server_1.createNotifications)(body);
    return {
        success: true,
        status: 200,
        orderId: savedRes._id,
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
    stock_universal_server_1.mainLogger.info('addPayment');
    const newProd = new payment_model_1.paymentMain(payment);
    const savedRes = await newProd.save().catch((err) => err);
    if (savedRes instanceof mongoose_1.Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return errResponse;
    }
    if (paid) {
        const title = 'New Payment';
        const notifnBody = 'Payment for item made';
        const actions = [
            {
                action: 'view',
                title: 'See Payment',
                operation: '',
                url: `payment/${savedRes._id}`
            }
        ];
        const body = {
            notification: (0, stock_notif_server_1.makeNotfnBody)(userId, title, notifnBody, 'payments', actions, savedRes._id),
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
    stock_universal_server_1.mainLogger.debug('paymentMethodDelegator: type - ', type);
    if (burgain.state) {
        const bgainCode = await promocode_model_1.promocodeLean
            .findOne({
            code: burgain.code,
            state: 'virgin',
            items: order.items
        }).lean();
        if (bgainCode) {
            const updateRes = await promocode_model_1.promocodeMain.updateOne({
                code: burgain.code,
                state: 'virgin',
                items: order.items
            }, { $set: { state: 'inOperation' } }).catch((err) => err);
            if (updateRes instanceof mongoose_1.Error) {
                const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
                return errResponse;
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
        case 'wallet': {
            response = await (0, exports.payWithWallet)(res, paymentRelated, invoiceRelated, order, payment, userId, companyId);
            break;
        }
        default:
            response = await (0, exports.payOnDelivery)(res, paymentRelated, invoiceRelated, order, payment, userId, companyId);
            break;
    }
    stock_universal_server_1.mainLogger.debug('paymentMethodDelegator - response', response);
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
            }).catch((err) => err);
        }
    }
    return response;
};
exports.paymentMethodDelegator = paymentMethodDelegator;
const relegatePesapalPayment = async (res, paymentRelated, invoiceRelated, type, order, payment, userId, companyId) => {
    stock_universal_server_1.mainLogger.debug('relegatePesapalPayment', paymentRelated);
    const isValidCompanyId = (0, stock_universal_server_1.verifyObjectId)(paymentRelated.companyId);
    if (isValidCompanyId) {
        const company = await stock_auth_server_1.companyMain.findById(paymentRelated.companyId);
        if (!company) {
            // return { success: false, status: 401, err: 'user must be of a company' };
        }
    }
    const appended = await appendAll(res, paymentRelated, invoiceRelated, order, payment, userId, companyId);
    if (!appended.paymentRelated) {
        return { success: false, status: 403, errmsg: 'could not complete transaction' };
    }
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
    stock_universal_server_1.mainLogger.debug('b4 pesapalPaymentInstance.submitOrder', appended.paymentRelated.toString());
    const response = await stock_counter_server_1.pesapalPaymentInstance.submitOrder(payDetails, appended.paymentRelated.toString(), 'Complete product payment');
    if (!response.success || !response.pesaPalOrderRes?.order_tracking_id) {
        const deteils = {
            paymentRelated: appended.paymentRelated,
            invoiceRelated: appended.invoiceRelated,
            order: appended.order
        };
        await deleteCreatedDocsOnFailure(deteils);
        return response;
    }
    stock_universal_server_1.mainLogger.debug('pesapalPaymentInstance.submitOrder', response);
    const isValid = (0, stock_universal_server_1.verifyObjectId)(appended.paymentRelated.toString());
    if (!isValid) {
        return { success: false, status: 401, pesapalOrderRes: null, paymentRelated: null };
    }
    const related = await paymentrelated_model_1.paymentRelatedMain.findById(appended.paymentRelated.toString());
    stock_universal_server_1.mainLogger.info('after paymentRelatedMain.findById');
    if (related) {
        related.pesaPalorderTrackingId = response.pesaPalOrderRes.order_tracking_id;
        const saveRes = await related.save().catch((err) => err);
        if (saveRes instanceof mongoose_1.Error) {
            const errResponse = (0, stock_universal_server_1.handleMongooseErr)(saveRes);
            return errResponse;
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