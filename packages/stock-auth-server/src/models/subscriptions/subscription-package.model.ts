import { IsubscriptionPackage } from '@open-stock/stock-universal';
import {
  connectDatabase, createExpireDocIndex,
  globalSchemaObj, globalSelectObj, isDbConnected,
  mainConnection,
  mainConnectionLean
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

export type TsubscriptionPackage= Document & IsubscriptionPackage;

/** subscription package schema */
const subscriptionPackageSchema: Schema<TsubscriptionPackage> = new Schema<TsubscriptionPackage>({
  ...globalSchemaObj,
  name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  amount: { type: Number, unique: true, required: [true, 'cannot be empty.'], index: true },
  duration: { type: Number, required: [true, 'cannot be empty.'], index: true }, // in days
  active: { type: Boolean, required: [true, 'cannot be empty.'], index: true },
  features: []
}, { timestamps: true, collection: 'companysubscriptions' });

// Apply the uniqueValidator plugin to subscriptionPackageSchema.
subscriptionPackageSchema.plugin(uniqueValidator);

/** Primary selection object for subscription package */
const subscriptionPackageselect = {
  ...globalSelectObj,
  name: 1,
  amount: 1,
  duration: 1,
  active: 1,
  features: 1
};

/**
 * Represents the main subscription package model.
 */
export let subscriptionPackageMain: Model<TsubscriptionPackage>;

/**
 * Represents a lean subscription package model.
 */
export let subscriptionPackageLean: Model<TsubscriptionPackage>;

/**
 * Selects the subscriptionPackageselect constant from the subscriptionPackage.model module.
 */
export const subscriptionPackageSelect = subscriptionPackageselect;

/**
 * Creates a new subscription package model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createSubscriptionPackageModel = async(
  dbUrl: string,
  dbOptions?: ConnectOptions,
  main = true,
  lean = true
) => {
  createExpireDocIndex(subscriptionPackageSchema);
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    subscriptionPackageMain = mainConnection
      .model<TsubscriptionPackage>('SubscriptionPackage', subscriptionPackageSchema);
  }

  if (lean) {
    subscriptionPackageLean = mainConnectionLean
      .model<TsubscriptionPackage>('SubscriptionPackage', subscriptionPackageSchema);
  }
};
