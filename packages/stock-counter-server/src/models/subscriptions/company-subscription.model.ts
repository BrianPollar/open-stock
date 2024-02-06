import { Document, Model, Schema } from 'mongoose';
import { IcompanySubscription } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

export type TcompanySubscription= Document & IcompanySubscription;

/** FAQ schema */
const companySubscriptionSchema: Schema = new Schema({
  subscriprionId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  startDate: { type: Date, required: [true, 'cannot be empty.'], index: true },
  endDate: { type: Date, required: [true, 'cannot be empty.'], index: true },
  features: []
}, { timestamps: true });

// Apply the uniqueValidator plugin to companySubscriptionSchema.
companySubscriptionSchema.plugin(uniqueValidator);

/** Primary selection object for FAQ */
const companySubscriptionselect = {
  subscriprionId: 1,
  startDate: 1,
  endDate: 1,
  features: 1
};

/**
 * Represents the main FAQ model.
 */
export let companySubscriptionMain: Model<TcompanySubscription>;

/**
 * Represents a lean FAQ model.
 */
export let companySubscriptionLean: Model<TcompanySubscription>;

/**
 * Selects the companySubscriptionselect constant from the companySubscription.model module.
 */
export const companySubscriptionSelect = companySubscriptionselect;

/**
 * Creates a new FAQ model.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createSubscriptionPackageModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    companySubscriptionMain = mainConnection.model<TcompanySubscription>('Faq', companySubscriptionSchema);
  }

  if (lean) {
    companySubscriptionLean = mainConnectionLean.model<TcompanySubscription>('Faq', companySubscriptionSchema);
  }
};
