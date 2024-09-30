"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentRelatedModel = exports.paymentRelatedSelect = exports.paymentRelatedLean = exports.paymentRelatedMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
/**
 * Payment Related Schema
 * @typedef {Object} PaymentRelatedSchema
 * @property {string} pesaPalorderTrackingId - PesaPal order tracking ID
 * @property {string} urId - Unique ID
 * @property {Date} orderDate - Order date
 * @property {Date} paymentDate - Payment date
 * @property {Object} billingAddress - Billing address
 * @property {Object} shippingAddress - Shipping address
 * @property {string} currency - Currency
 * @property {boolean} isBurgain - Is bargain
 * @property {number} shipping - Shipping
 * @property {boolean} manuallyAdded - Manually added
 * @property {string} paymentMethod - Payment method
 * @property {Date} createdAt - Timestamp of creation
 * @property {Date} updatedAt - Timestamp of last update
 */
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
    paymentMethod: { type: String },
    payType: { type: String, index: true },
    orderStatus: { type: String, index: true, default: 'pending' }
}, { timestamps: true, collection: 'paymentrelateds' });
// Apply the uniqueValidator plugin to paymentRelatedSchema.
paymentRelatedSchema.plugin(uniqueValidator);
paymentRelatedSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
paymentRelatedSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
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
    orderStatus: 1
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
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.paymentRelatedMain = database_1.mainConnection
            .model('paymentRelated', paymentRelatedSchema);
    }
    if (lean) {
        exports.paymentRelatedLean = database_1.mainConnectionLean
            .model('paymentRelated', paymentRelatedSchema);
    }
};
exports.createPaymentRelatedModel = createPaymentRelatedModel;
//# sourceMappingURL=paymentrelated.model.js.map