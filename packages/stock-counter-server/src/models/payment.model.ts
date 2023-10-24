import { Document, Model, Schema } from 'mongoose';
import { IinvoiceRelated, IpaymentRelated } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for payment by*/
/** */
export type Tpayment = Document & {
  paymentRelated: string | IpaymentRelated;
  invoiceRelated: string | IinvoiceRelated;
  order: string;
};

const paymentSchema: Schema<Tpayment> = new Schema({
  paymentRelated: { type: String, unique: true },
  invoiceRelated: { type: String, unique: true },
  order: { type: String }
}, { timestamps: true });

// Apply the uniqueValidator plugin to paymentSchema.
paymentSchema.plugin(uniqueValidator);

/** primary selection object
 * for payment
 */
const paymentselect = {
  paymentRelated: 1,
  invoiceRelated: 1,
  order: 1
};

/** main connection for payments Operations*/
export let paymentMain: Model<Tpayment>;
/** lean connection for payments Operations*/
export let paymentLean: Model<Tpayment>;
/** primary selection object
 * for payment
 */
/** */
export const paymentSelect = paymentselect;

/** */
/**
 * Creates a payment model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the payment model for the main connection.
 * @param lean Whether to create the payment model for the lean connection.
 */
export const createPaymentModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    paymentMain = mainConnection.model<Tpayment>('Payment', paymentSchema);
  }

  if (lean) {
    paymentLean = mainConnectionLean.model<Tpayment>('Payment', paymentSchema);
  }
};
