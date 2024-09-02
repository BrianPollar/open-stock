/**
 * @file This file defines the Mongoose schema and model for the subscription collection.
 * @requires mongoose
 * @requires ../controllers/database.controller
 * @requires mongoose-unique-validator
 */
import { Schema } from 'mongoose';
import { connectNotifDatabase, isNotifDbConnected, mainConnection, mainConnectionLean } from '../utils/database';
const uniqueValidator = require('mongoose-unique-validator');
/**
 * Mongoose schema for the subscription collection.
 */
const subscriptionSchema = new Schema({
    subscription: {},
    userId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true }
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
export let subscriptionMain;
/**
 * Represents a lean subscription model.
 */
export let subscriptionLean;
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
export const createSubscriptionModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isNotifDbConnected) {
        await connectNotifDatabase(dbUrl, dbOptions);
    }
    if (main) {
        subscriptionMain = mainConnection.model('Subscription', subscriptionSchema);
    }
    if (lean) {
        subscriptionLean = mainConnectionLean.model('Subscription', subscriptionSchema);
    }
};
//# sourceMappingURL=subscriptions.model.js.map