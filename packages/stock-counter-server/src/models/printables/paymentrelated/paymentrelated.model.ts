import { IpaymentRelated } from '@open-stock/stock-universal';
import {
  connectDatabase,
  createExpireDocIndex,
  isDbConnected, mainConnection, mainConnectionLean,
  preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for paymentRelated by */
export type TpaymentRelated = Document & IpaymentRelated & { pesaPalorderTrackingId: string };

const paymentRelatedSchema: Schema<TpaymentRelated> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  pesaPalorderTrackingId: { type: String },
  // creationType: { type: String, required: [true, 'cannot be empty.'] },
  // items: [{ type: String }],
  orderDate: { type: Date, index: true },
  paymentDate: { type: Date, index: true },
  // amount: { type: Number, required: [true, 'cannot be empty.'] },
  billingAddress: { },
  shippingAddress: { },
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

paymentRelatedSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

paymentRelatedSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});

function checkPayMethod(val: string) {
  return val === 'paypal' || val === 'bank transfer' || val === 'cash' || val === 'pesapal' || val === 'wallet';
}

function checkPayOrderStatus(val: string) {
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
  orderStatus: 1,
  orderDeliveryCode: 1
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
export const createPaymentRelatedModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(paymentRelatedSchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    paymentRelatedMain = mainConnection
      .model<TpaymentRelated>('paymentRelated', paymentRelatedSchema);
  }

  if (lean) {
    paymentRelatedLean = mainConnectionLean
      .model<TpaymentRelated>('paymentRelated', paymentRelatedSchema);
  }
};

