import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../utils/database';
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
const paymentRelatedSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
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
    return preUpdateDocExpire(this, next);
});
paymentRelatedSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
/** primary selection object
 * for paymentRelated
 */
const paymentRelatedselect = {
    ...withUrIdAndCompanySelectObj,
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
 * Represents the main payment related model.
 */
export let paymentRelatedMain;
/**
 * Represents the payment related lean model.
 */
export let paymentRelatedLean;
/**
 * Represents the payment related select function.
 */
export const paymentRelatedSelect = paymentRelatedselect;
/**
 * Creates a payment related model.
 * @param dbUrl - The URL of the database.
 * @param main - Indicates whether to create the main connection model. Default is true.
 * @param lean - Indicates whether to create the lean connection model. Default is true.
 */
export const createPaymentRelatedModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(paymentRelatedSchema);
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        paymentRelatedMain = mainConnection
            .model('paymentRelated', paymentRelatedSchema);
    }
    if (lean) {
        paymentRelatedLean = mainConnectionLean
            .model('paymentRelated', paymentRelatedSchema);
    }
};
//# sourceMappingURL=paymentrelated.model.js.map