import { IcompanySubscription } from '@open-stock/stock-universal';
import { createExpireDocIndex, withCompanySchemaObj, withCompanySelectObj } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';

const uniqueValidator = require('mongoose-unique-validator');

export type TcompanySubscription= Document & IcompanySubscription;

/** company subscription schema */
const companySubscriptionSchema: Schema<TcompanySubscription> = new Schema<TcompanySubscription>({
  ...withCompanySchemaObj,
  name: { type: String },
  ammount: { type: Number },
  duration: { type: Number },
  active: { type: Boolean, default: false },
  // subscriprionId: { type: String },
  startDate: { type: Date, required: [true, 'cannot be empty.'], index: true },
  endDate: { type: Date, required: [true, 'cannot be empty.'], index: true },
  pesaPalorderTrackingId: { type: String, inddex: true },
  status: { type: String },
  features: []
}, { timestamps: true, collection: 'companysubscriptions' });

companySubscriptionSchema.index({ endDate: -1 });

// Apply the uniqueValidator plugin to companySubscriptionSchema.
companySubscriptionSchema.plugin(uniqueValidator);

/** Primary selection object for FAQ */
const companySubscriptionselect = {
  ...withCompanySelectObj,
  name: 1,
  ammount: 1,
  duration: 1,
  active: 1,
  subscriprionId: 1,
  startDate: 1,
  endDate: 1,
  pesaPalorderTrackingId: 1,
  status: 1,
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
  createExpireDocIndex(companySubscriptionSchema);
  if (!isAuthDbConnected) {
    await connectAuthDatabase(dbUrl, dbOptions);
  }

  if (main) {
    companySubscriptionMain = mainConnection.model<TcompanySubscription>('CompanySubscription', companySubscriptionSchema);
  }

  if (lean) {
    companySubscriptionLean = mainConnectionLean.model<TcompanySubscription>('CompanySubscription', companySubscriptionSchema);
  }
};
