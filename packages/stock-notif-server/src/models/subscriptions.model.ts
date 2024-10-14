/**
 * @file This file defines the Mongoose schema and model for the subscription collection.
 * @requires mongoose
 * @requires ../controllers/database.controller
 * @requires mongoose-unique-validator
 */

import { connectDatabase, isDbConnected, mainConnection, mainConnectionLean } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');

/**
 * Interface for the subscription document.
 */
export interface ISubscription extends Document {
  subscription;
  userId: string | Schema.Types.ObjectId;
}

/**
 * Mongoose schema for the subscription collection.
 */
const subscriptionSchema: Schema<ISubscription> = new Schema({
  subscription: {},
  userId: { type: Schema.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true, collection: 'subscriptions' });

// Apply the uniqueValidator plugin to subscriptionSchema.
subscriptionSchema.plugin(uniqueValidator);

/**
 * Primary selection object for subscription.
 */
const subscriptionselect = {
  subscription: 1,
  userId: 1
};

/**
 * Represents the main subscription model.
 */
export let subscriptionMain: Model<ISubscription>;

/**
 * Represents a lean subscription model.
 */
export let subscriptionLean: Model<ISubscription>;

/**
 * Represents the subscription select function.
 */
export const subscriptionSelect = subscriptionselect;

/**
 * Creates the Mongoose model for the subscription collection.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection.
 * @param lean - Whether to create the lean connection.
 */
export const createSubscriptionModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    subscriptionMain = mainConnection
      .model<ISubscription>('Subscription', subscriptionSchema);
  }

  if (lean) {
    subscriptionLean = mainConnectionLean
      .model<ISubscription>('Subscription', subscriptionSchema);
  }
};
