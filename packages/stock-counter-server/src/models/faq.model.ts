import { Document, Model, Schema } from 'mongoose';
import { Ifaq } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/** Model type for FAQ */
export type Tfaq = Document & Ifaq;

/** FAQ schema */
const faqSchema: Schema<Tfaq> = new Schema({
  urId: { type: String, unique: true },
  posterName: { type: String },
  posterEmail: { type: String, required: [true, 'cannot be empty.'], index: true },
  userId: { type: String },
  qn: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });

// Apply the uniqueValidator plugin to faqSchema.
faqSchema.plugin(uniqueValidator);

/** Primary selection object for FAQ */
const faqselect = {
  urId: 1,
  posterName: 1,
  posterEmail: 1,
  userId: 1,
  qn: 1
};

/** Main connection for FAQ operations */
export let faqMain: Model<Tfaq>;
/** Lean connection for FAQ operations */
export let faqLean: Model<Tfaq>;

/** Primary selection object for FAQ */
export const faqSelect = faqselect;

/**
 * Creates a new FAQ model.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createFaqModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    faqMain = mainConnection.model<Tfaq>('Faq', faqSchema);
  }

  if (lean) {
    faqLean = mainConnectionLean.model<Tfaq>('Faq', faqSchema);
  }
};
