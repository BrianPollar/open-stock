import { Ifaqanswer } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a FAQ answer document.
 * Extends the Document interface and the Ifaqanswer interface.
 */
export type Tfaqanswer = Document & Ifaqanswer;

const faqanswerSchema: Schema<Tfaqanswer> = new Schema({
  urId: { type: String },
  companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
  faq: { type: String, required: [true, 'cannot be empty.'], index: true },
  userId: { type: String, required: [true, 'cannot be empty.'] },
  ans: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });

// Apply the uniqueValidator plugin to faqanswerSchema.
faqanswerSchema.plugin(uniqueValidator);

/** primary selection object
 * for faq ans
 */
const faqanswerselect = {
  urId: 1,
  companyId: 1,
  faq: 1,
  userId: 1,
  ans: 1
};

/**
 * The main faqanswer model.
 */
export let faqanswerMain: Model<Tfaqanswer>;

/**
 * Represents a lean version of the FAQ answer model.
 */
export let faqanswerLean: Model<Tfaqanswer>;

/**
 * Selects the faqanswer object.
 */
export const faqanswerSelect = faqanswerselect;

/**
 * Creates a Faqanswer model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the Faqanswer model for the main connection.
 * @param lean Whether to create the Faqanswer model for the lean connection.
 */
export const createFaqanswerModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    faqanswerMain = mainConnection.model<Tfaqanswer>('Faqanswer', faqanswerSchema);
  }

  if (lean) {
    faqanswerLean = mainConnectionLean.model<Tfaqanswer>('Faqanswer', faqanswerSchema);
  }
};
