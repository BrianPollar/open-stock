/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Document, Model, Schema } from 'mongoose';
import { IinvoiceRelatedRef, IurId } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** model type for receipt by*/
/** */
export type Treceipt = Document & IurId & IinvoiceRelatedRef & {
  ammountRcievd: number;
  paymentMode: string;
  type: string;
  date: Date;
  amount: number;
};

const receiptSchema: Schema<Treceipt> = new Schema({
  urId: { type: String, unique: true },
  invoiceRelated: { type: String },
  ammountRcievd: { type: Number },
  paymentMode: { type: String },
  type: { type: String },
  amount: { type: Number },
  date: { type: Date }
}, { timestamps: true });

// Apply the uniqueValidator plugin to receiptSchema.
receiptSchema.plugin(uniqueValidator);

/** primary selection object
 * for receipt
 */
const receiptselect = {
  urId: 1,
  invoiceRelated: 1,
  ammountRcievd: 1,
  paymentMode: 1,
  type: 1,
  amount: 1,
  date: 1
};

/** main connection for receipts Operations*/
export let receiptMain: Model<Treceipt>;
/** lean connection for receipts Operations*/
export let receiptLean: Model<Treceipt>;
/** primary selection object
 * for receipt
 */
/** */
export const receiptSelect = receiptselect;

/** */
/**
 * Creates a new receipt model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createReceiptModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    receiptMain = mainConnection.model<Treceipt>('Receipt', receiptSchema);
  }

  if (lean) {
    receiptLean = mainConnectionLean.model<Treceipt>('Receipt', receiptSchema);
  }
};
