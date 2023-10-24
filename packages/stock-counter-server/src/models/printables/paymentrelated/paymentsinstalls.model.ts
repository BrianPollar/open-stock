/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
/* import { Document, Model, Schema } from 'mongoose';
import { IpaymentInstall } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for invoice payment by */
/** */
/* export type TpaymentInstall = Document & IpaymentInstall;

const paymentInstallSchema: Schema<TpaymentInstall> = new Schema({
  urId: { type: String, unique: true },
  amount: { type: Number },
  date: { type: Date },
  type: { type: String },
  relatedId: { type: String }
}, { timestamps: true });

// Apply the uniqueValidator plugin to paymentInstallSchema.
paymentInstallSchema.plugin(uniqueValidator);

/** primary selection object
 * for invoice
 */
/* const paymentInstallsselect = {
  urId: 1,
  amount: 1,
  date: 1,
  type: 1,
  relatedId: 1
};

/** main connection for invoices Operations*/
// export let paymentInstallsMain: Model<TpaymentInstall>;
/** lean connection for invoices Operations*/
// export let paymentInstallsLean: Model<TpaymentInstall>;
/** primary selection object
 * for invoice
 */
/** */
// export const paymentInstallsSelect = paymentInstallsselect;

/** */
/* export const createPaymentInstallModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    paymentInstallsMain = mainConnection.model<TpaymentInstall>('PaymentInstall', paymentInstallSchema);
  }

  if (lean) {
    paymentInstallsLean = mainConnectionLean.model<TpaymentInstall>('PaymentInstall', paymentInstallSchema);
  }
};
*/
