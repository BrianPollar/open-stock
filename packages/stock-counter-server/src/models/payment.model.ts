import { IinvoiceRelated, IpaymentRelated } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a payment document.
 */
export type Tpayment = Document & {
  companyId: string;
  paymentRelated: string | IpaymentRelated;
  invoiceRelated: string | IinvoiceRelated;
  order: string;
  isDeleted?: boolean;
};

const paymentSchema: Schema<Tpayment> = new Schema({
  companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
  paymentRelated: { type: String, unique: true },
  invoiceRelated: { type: String, unique: true },
  order: { type: String }
}, { timestamps: true, collection: 'payments' });

// Apply the uniqueValidator plugin to paymentSchema.
paymentSchema.plugin(uniqueValidator);

paymentSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

paymentSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


/** primary selection object
 * for payment
 */
const paymentselect = {
  companyId: 1,
  paymentRelated: 1,
  invoiceRelated: 1,
  order: 1
};

/**
 * Represents the main payment model.
 */
export let paymentMain: Model<Tpayment>;

/**
 * Represents a lean payment model.
 */
export let paymentLean: Model<Tpayment>;

/**
 * Represents a payment select function.
 */
export const paymentSelect = paymentselect;

/**
 * Creates a payment model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the payment model for the main connection.
 * @param lean Whether to create the payment model for the lean connection.
 */
export const createPaymentModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(paymentSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    paymentMain = mainConnection.model<Tpayment>('Payment', paymentSchema);
  }

  if (lean) {
    paymentLean = mainConnectionLean.model<Tpayment>('Payment', paymentSchema);
  }
};

