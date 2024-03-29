/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Document, Model, Schema } from 'mongoose';
import { IinvoiceRelatedRef, IurId } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a receipt document.
 */
export type Treceipt = Document & IurId & IinvoiceRelatedRef & {
  /**
   * The amount received.
   */
  ammountRcievd: number;
  /**
   * The payment mode.
   */
  paymentMode: string;
  /**
   * The type of receipt.
   */
  type: string;
  /**
   * The date of the receipt.
   */
  date: Date;
  /**
   * The total amount.
   */
  amount: number;
};

const receiptSchema: Schema<Treceipt> = new Schema({
  urId: { type: String, unique: true },
  companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
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
  companyId: 1,
  invoiceRelated: 1,
  ammountRcievd: 1,
  paymentMode: 1,
  type: 1,
  amount: 1,
  date: 1
};

/**
 * Represents the main receipt model.
 */
export let receiptMain: Model<Treceipt>;

/**
 * Represents a lean receipt model.
 */
export let receiptLean: Model<Treceipt>;

/**
 * Represents the receipt select function.
 */
export const receiptSelect = receiptselect;


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

