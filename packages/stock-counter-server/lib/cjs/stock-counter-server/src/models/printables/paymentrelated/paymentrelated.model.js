"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentRelatedModel = exports.paymentRelatedSelect = exports.paymentRelatedLean = exports.paymentRelatedMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const paymentRelatedSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    pesaPalorderTrackingId: { type: String },
    // creationType: { type: String, required: [true, 'cannot be empty.'] },
    // items: [{ type: String }],
    orderDate: { type: Date, index: true },
    paymentDate: { type: Date, index: true },
    // amount: { type: Number, required: [true, 'cannot be empty.'] },
    billingAddress: {},
    shippingAddress: {},
    // tax: { type: Number },
    currency: { type: String },
    // user: { type: String },
    isBurgain: { type: Boolean, default: false },
    shipping: { type: Number },
    manuallyAdded: { type: Boolean, default: false },
    // status: { type: String, default: 'pending' },
    paymentMethod: {
        type: String,
        validator: checkPayMethod,
        message: props => `${props.value} is invalid, payment method can be paypal, bank transfer, wallet, cash or pesapal!`
    },
    payType: { type: String, index: true },
    orderStatus: {
        type: String,
        index: true,
        default: 'pending',
        validator: checkPayOrderStatus,
        message: props => `${props.value} is invalid, order status can be pending, 
    paidNotDelivered, delivered, paidAndDelivered, processing or cancelled!`
    },
    orderDeliveryCode: { type: String }
}, { timestamps: true, collection: 'paymentrelateds' });
// Apply the uniqueValidator plugin to paymentRelatedSchema.
paymentRelatedSchema.plugin(uniqueValidator);
paymentRelatedSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
paymentRelatedSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
function checkPayMethod(val) {
    return val === 'paypal' || val === 'bank transfer' || val === 'cash' || val === 'pesapal' || val === 'wallet';
}
function checkPayOrderStatus(val) {
    return val === 'pending' ||
        val === 'paidNotDelivered' ||
        val === 'delivered' ||
        val === 'paidAndDelivered' ||
        val === 'processing' ||
        val === 'cancelled';
}
/** primary selection object
 * for paymentRelated
 */
const paymentRelatedselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    // items: 1,
    orderDate: 1,
    paymentDate: 1,
    // amount: 1,
    billingAddress: 1,
    shippingAddress: 1,
    // tax: 1,
    currency: 1,
    // user: 1,
    isBurgain: 1,
    shipping: 1,
    manuallyAdded: 1,
    // status: 1,
    paymentMethod: 1,
    payType: 1,
    orderStatus: 1,
    orderDeliveryCode: 1
};
/**
 * Represents the payment related select function.
 */
exports.paymentRelatedSelect = paymentRelatedselect;
/**
 * Creates a payment related model.
 * @param dbUrl - The URL of the database.
 * @param main - Indicates whether to create the main connection model. Default is true.
 * @param lean - Indicates whether to create the lean connection model. Default is true.
 */
const createPaymentRelatedModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(paymentRelatedSchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.paymentRelatedMain = stock_universal_server_1.mainConnection
            .model('paymentRelated', paymentRelatedSchema);
    }
    if (lean) {
        exports.paymentRelatedLean = stock_universal_server_1.mainConnectionLean
            .model('paymentRelated', paymentRelatedSchema);
    }
};
exports.createPaymentRelatedModel = createPaymentRelatedModel;
//# sourceMappingURL=paymentrelated.model.js.map