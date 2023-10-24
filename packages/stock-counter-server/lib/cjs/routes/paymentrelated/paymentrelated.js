"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePaymentInstall = exports.deleteAllPayOrderLinked = exports.deleteManyPaymentRelated = exports.makePaymentRelatedPdct = exports.relegatePaymentRelatedCreation = exports.updatePaymentRelated = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const order_model_1 = require("../../models/order.model");
const payment_model_1 = require("../../models/payment.model");
const paymentrelated_model_1 = require("../../models/printables/paymentrelated/paymentrelated.model");
const invoicerelated_1 = require("../printables/related/invoicerelated");
const log4js_1 = require("log4js");
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const receipt_model_1 = require("../../models/printables/receipt.model");
/** */
const paymentRelatedLogger = (0, log4js_1.getLogger)('routes/PaymentRelated');
/** */
const updatePaymentRelated = async (paymentRelated) => {
    console.log('okay here 111111', paymentRelated);
    const isValid = (0, stock_universal_server_1.verifyObjectId)(paymentRelated.paymentRelated);
    if (!isValid) {
        return { success: false, err: 'unauthourised', status: 401 };
    }
    const related = await paymentrelated_model_1.paymentRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(paymentRelated.paymentRelated);
    if (!related) {
        return { success: true, status: 200 };
    }
    // related.items = paymentRelated.items || related.items;
    related['orderDate'] = paymentRelated.orderDate || related['orderDate'];
    related['paymentDate'] = paymentRelated.paymentDate || related['paymentDate'];
    // related.payments = paymentRelated.payments || related.payments;
    related['billingAddress'] = paymentRelated.billingAddress || related['billingAddress'];
    related['shippingAddress'] = paymentRelated.shippingAddress || related['shippingAddress'];
    // related.tax = paymentRelated.tax || related.tax;
    related['currency'] = paymentRelated.currency || related['currency'];
    // related.user = paymentRelated.user || related.user;
    related['isBurgain'] = paymentRelated.isBurgain || related['isBurgain'];
    related['shipping'] = paymentRelated.shipping || related['shipping'];
    related['manuallyAdded'] = paymentRelated.manuallyAdded || related['manuallyAdded'];
    related['paymentMethod'] = paymentRelated.paymentMethod || related['paymentMethod'];
    // related.status = paymentRelated.status || related.status;
    let errResponse;
    const saved = await related.save()
        .catch(err => {
        paymentRelatedLogger.debug('updatePaymentRelated - err: ', err);
        errResponse = {
            status: 403,
            success: false
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
    else {
        return { success: true, status: 200, id: saved._id };
    }
};
exports.updatePaymentRelated = updatePaymentRelated;
/** */
const relegatePaymentRelatedCreation = async (paymentRelated, invoiceRelated, type, // say payment or order
extraNotifDesc, notifRedirectUrl) => {
    console.log('FUCK HERE 11111111', paymentRelated);
    const isValid = (0, stock_universal_server_1.verifyObjectId)(paymentRelated.paymentRelated);
    let found;
    if (isValid) {
        found = await paymentrelated_model_1.paymentRelatedLean
            .findById(paymentRelated.paymentRelated).lean().select({ urId: 1 });
    }
    if (!found || paymentRelated.creationType === 'solo') {
        const count = await paymentrelated_model_1.paymentRelatedMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        paymentRelated.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
        let errResponse;
        const newPayRelated = new paymentrelated_model_1.paymentRelatedMain(paymentRelated);
        const saved = await newPayRelated.save().catch(err => {
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
        // const relatedId = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, true);
        let route;
        let title = '';
        let accessor;
        let notifType;
        if (type === 'order') {
            route = 'orders';
            title = 'Order Made';
            accessor = 'orders';
            notifType = 'orders';
        }
        else {
            route = 'payments';
            title = 'Payment Made';
            accessor = 'payments';
            notifType = 'payments';
        }
        if (stock_notif_server_1.smsHandler.stn && stock_notif_server_1.smsHandler.stn[accessor]) {
            const actions = [{
                    operation: 'view',
                    url: notifRedirectUrl + route,
                    action: '',
                    title
                }];
            const notification = {
                actions,
                userId: invoiceRelated.billingUserId,
                title,
                body: extraNotifDesc,
                icon: '',
                notifType,
                // photo: string;
                expireAt: '200000'
            };
            const capableUsers = await stock_auth_server_1.user.find({})
                .lean().select({ permissions: 1 });
            const ids = [];
            if (type === 'order') {
                for (const cuser of capableUsers) {
                    if (cuser.permissions.orders) {
                        ids.push(cuser._id);
                    }
                }
            }
            else {
                for (const cuser of capableUsers) {
                    if (cuser.permissions.payments) {
                        ids.push(cuser._id);
                    }
                }
            }
            const notifFilters = { id: { $in: ids } };
            await (0, stock_notif_server_1.createNotifications)({
                options: notification,
                filters: notifFilters
            });
        }
        return { success: true, status: 200, id: saved._id };
        /** return {
          paymentRelated: saved._id as string
          // invoiceRelated: relatedId
        };*/
    }
    else {
        await (0, exports.updatePaymentRelated)(paymentRelated);
        // await updateInvoiceRelated(invoiceRelated);
        return { success: true, status: 200, id: paymentRelated.paymentRelated._id };
        /** return {
          paymentRelated: paymentRelated.paymentRelated
          // invoiceRelated: invoiceRelated.invoiceRelated
        };*/
    }
};
exports.relegatePaymentRelatedCreation = relegatePaymentRelatedCreation;
/** */
const makePaymentRelatedPdct = (paymentRelated, invoiceRelated, 
// eslint-disable-next-line @typescript-eslint/no-shadow
user, meta) => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: meta._id,
    // createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    paymentRelated: paymentRelated._id,
    urId: paymentRelated.urId,
    // items: paymentRelated.items,
    orderDate: paymentRelated.orderDate,
    paymentDate: paymentRelated.paymentDate,
    // payments: paymentRelated.payments,
    billingAddress: paymentRelated.billingAddress,
    shippingAddress: paymentRelated.shippingAddress,
    // tax: paymentRelated.tax,
    currency: paymentRelated.currency,
    // user: paymentRelated.user,
    isBurgain: paymentRelated.isBurgain,
    shipping: paymentRelated.shipping,
    manuallyAdded: paymentRelated.manuallyAdded,
    paymentMethod: paymentRelated.paymentMethod,
    // status: paymentRelated.status,
    ...(0, invoicerelated_1.makeInvoiceRelatedPdct)(invoiceRelated, user)
});
exports.makePaymentRelatedPdct = makePaymentRelatedPdct;
/** */
const deleteManyPaymentRelated = async (ids) => {
    console.log('this is called deleteManyPaymentRelated');
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return { success: false, status: 402, err: 'unauthourised' };
    }
    console.log('passed isValid in deleteManyPaymentRelated');
    const deletedMany = await paymentrelated_model_1.paymentRelatedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } });
    if (Boolean(deletedMany)) {
        return { success: Boolean(deletedMany), status: 200 };
    }
    else {
        return { success: Boolean(deletedMany), status: 403, err: 'could not delete selected documents, try again in a while' };
    }
};
exports.deleteManyPaymentRelated = deleteManyPaymentRelated;
/** */
const deleteAllPayOrderLinked = async (paymentRelated, invoiceRelated, creationType, where) => {
    console.log('let shoot payment creationType here', creationType, where);
    await (0, exports.deleteManyPaymentRelated)([paymentRelated]);
    await (0, invoicerelated_1.deleteManyInvoiceRelated)([invoiceRelated]);
    if (creationType !== 'solo') {
        await payment_model_1.paymentMain.deleteOne({ paymentRelated });
        await order_model_1.orderMain.deleteOne({ paymentRelated });
    }
    else if (where === 'payment') {
        await payment_model_1.paymentMain.deleteOne({ paymentRelated });
    }
    else if (where === 'order') {
        await order_model_1.orderMain.deleteOne({ paymentRelated });
    }
};
exports.deleteAllPayOrderLinked = deleteAllPayOrderLinked;
// .catch(err => {});
/** */
const makePaymentInstall = async (receipt, relatedId) => {
    // const pInstall = invoiceRelated.payments[0] as IpaymentInstall;
    if (receipt) {
        console.log('ARRRRRRIVING FINE');
        let errResponse;
        receipt.invoiceRelated = relatedId;
        const newInstal = new receipt_model_1.receiptMain(receipt);
        const savedPinstall = await newInstal.save().catch(err => {
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
        console.log('maybe getting err res here', errResponse);
        if (errResponse) {
            return errResponse;
        }
        await (0, invoicerelated_1.updateInvoiceRelatedPayments)(savedPinstall);
        return { success: true };
    }
    return { success: true };
};
exports.makePaymentInstall = makePaymentInstall;
//# sourceMappingURL=paymentrelated.js.map