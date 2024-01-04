import { IpaymentRelated } from '@open-stock/stock-universal';
import { Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for paymentRelated by */

export type TpaymentRelated = Document & IpaymentRelated & { pesaPalorderTrackingId: string };

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
const paymentRelatedSchema: Schema = new Schema({
  pesaPalorderTrackingId: { type: String, required: [true, 'cannot be empty.'] },
  urId: { type: String, unique: true, required: [true, 'cannot be empty.'] },
  companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  // creationType: { type: String, required: [true, 'cannot be empty.'] },
  // items: [{ type: String }],
  orderDate: { type: Date, index: true },
  paymentDate: { type: Date, index: true },
  // amount: { type: Number, required: [true, 'cannot be empty.'] },
  billingAddress: { },
  shippingAddress: { },
  // tax: { type: Number },
  currency: { type: String, required: [true, 'cannot be empty.'] },
  // user: { type: String },
  isBurgain: { type: Boolean, default: false },
  shipping: { type: Number },
  manuallyAdded: { type: Boolean, default: false },
  // status: { type: String, default: 'pending' },
  paymentMethod: { type: String },
  payType: { type: String, index: true }
}, { timestamps: true });

// Apply the uniqueValidator plugin to paymentRelatedSchema.
paymentRelatedSchema.plugin(uniqueValidator);

/** primary selection object
 * for paymentRelated
 */
const paymentRelatedselect = {
  pesaPalorderTrackingId: 1,
  urId: 1,
  companyId: 1,
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
  payType: 1
};

/**
 * Represents the main payment related model.
 */
export let paymentRelatedMain: Model<TpaymentRelated>;

/**
 * Represents the payment related lean model.
 */
export let paymentRelatedLean: Model<TpaymentRelated>;

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
export const createPaymentRelatedModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    paymentRelatedMain = mainConnection.model<TpaymentRelated>('paymentRelated', paymentRelatedSchema);
  }

  if (lean) {
    paymentRelatedLean = mainConnectionLean.model<TpaymentRelated>('paymentRelated', paymentRelatedSchema);
  }
};

