import { Ifaq } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a FAQ document in the database.
 */
export type Tfaq = Document & Ifaq;

/** FAQ schema */
const faqSchema: Schema<Tfaq> = new Schema({
  ...withUrIdAndCompanySchemaObj,
  posterName: { type: String },
  posterEmail: { type: String, required: [true, 'cannot be empty.'], index: true },
  userId: { type: String },
  qn: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true, collection: 'faqs' });

faqSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

faqSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});


// Apply the uniqueValidator plugin to faqSchema.
faqSchema.plugin(uniqueValidator);

/** Primary selection object for FAQ */
const faqselect = {
  ...withUrIdAndCompanySelectObj,
  posterName: 1,
  posterEmail: 1,
  userId: 1,
  qn: 1
};

/**
 * Represents the main FAQ model.
 */
export let faqMain: Model<Tfaq>;

/**
 * Represents a lean FAQ model.
 */
export let faqLean: Model<Tfaq>;

/**
 * Selects the faqselect constant from the faq.model module.
 */
export const faqSelect = faqselect;

/**
 * Creates a new FAQ model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createFaqModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(faqSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    faqMain = mainConnection.model<Tfaq>('Faq', faqSchema);
  }

  if (lean) {
    faqLean = mainConnectionLean.model<Tfaq>('Faq', faqSchema);
  }
};
