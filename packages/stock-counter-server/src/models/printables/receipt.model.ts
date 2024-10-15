/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { IinvoiceRelatedRef, TreceiptType } from '@open-stock/stock-universal';
import {
  IcompanyIdAsObjectId,
  connectDatabase,
  createExpireDocIndex,
  isDbConnected, mainConnection, mainConnectionLean,
  preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a receipt document.
 */
export type Treceipt = Document & IinvoiceRelatedRef & {

  /**
   * The amount received.
   */
  amountRcievd: number;

  /**
   * The payment mode.
   */
  paymentMode: string;

  /**
   * The type of receipt.
   */
  type: TreceiptType;

  /**
   * The date of the receipt.
   */
  date: Date;

  /**
   * The total amount.
   */
  amount: number;
} & IcompanyIdAsObjectId;

const receiptSchema: Schema<Treceipt> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  invoiceRelated: { type: Schema.Types.ObjectId },
  amountRcievd: {
    type: Number,
    min: [0, 'cannot be less than 0.']
  },
  paymentMode: { type: String },
  type: { type: String },
  amount: {
    type: Number,
    min: [0, 'cannot be less than 0.']
  },
  date: { type: Date }
}, { timestamps: true, collection: 'receipts' });

receiptSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

receiptSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


// Apply the uniqueValidator plugin to receiptSchema.
receiptSchema.plugin(uniqueValidator);

/** primary selection object
 * for receipt
 */
const receiptselect = {
  ...withUrIdAndCompanySelectObj,
  invoiceRelated: 1,
  amountRcievd: 1,
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
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createReceiptModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(receiptSchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    receiptMain = mainConnection
      .model<Treceipt>('Receipt', receiptSchema);
  }

  if (lean) {
    receiptLean = mainConnectionLean
      .model<Treceipt>('Receipt', receiptSchema);
  }
};

