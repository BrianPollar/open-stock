import { IcompanySubscription } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../../stock-counter-server/src/controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');

export type TcompanySubscription= Document & IcompanySubscription;

/** company subscription schema */
const companySubscriptionSchema: Schema = new Schema({
  companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
  active: { type: Boolean, default: false },
  subscriprionId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  startDate: { type: Date, required: [true, 'cannot be empty.'], index: true },
  endDate: { type: Date, required: [true, 'cannot be empty.'], index: true },
  features: []
}, { timestamps: true });

companySubscriptionSchema.index({ endDate: -1 });

// Apply the uniqueValidator plugin to companySubscriptionSchema.
companySubscriptionSchema.plugin(uniqueValidator);

/** Primary selection object for FAQ */
const companySubscriptionselect = {
  companyId: 1,
  active: 1,
  subscriprionId: 1,
  startDate: 1,
  endDate: 1,
  features: 1
};

/**
 * Represents the main company subscription model.
 */
export let companySubscriptionMain: Model<TcompanySubscription>;

/**
 * Represents a lean company subscription model.
 */
export let companySubscriptionLean: Model<TcompanySubscription>;

/**
 * Selects the companySubscriptionselect constant from the companySubscription.model module.
 */
export const companySubscriptionSelect = companySubscriptionselect;

/**
 * Creates a new company subscription model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createCompanySubscription = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    companySubscriptionMain = mainConnection.model<TcompanySubscription>('CompanySubscription', companySubscriptionSchema);
  }

  if (lean) {
    companySubscriptionLean = mainConnectionLean.model<TcompanySubscription>('CompanySubscription', companySubscriptionSchema);
  }
};
