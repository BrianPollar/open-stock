import { createExpireDocIndex, globalSchemaObj, globalSelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';
const uniqueValidator = require('mongoose-unique-validator');
/** subscription package schema */
const subscriptionPackageSchema = new Schema({
    ...globalSchemaObj,
    name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    ammount: { type: Number, unique: true, required: [true, 'cannot be empty.'], index: true },
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
    ammount: 1,
    duration: 1,
    active: 1,
    features: 1
};
/**
 * Represents the main subscription package model.
 */
export let subscriptionPackageMain;
/**
 * Represents a lean subscription package model.
 */
export let subscriptionPackageLean;
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
export const createSubscriptionPackageModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(subscriptionPackageSchema);
    if (!isAuthDbConnected) {
        await connectAuthDatabase(dbUrl, dbOptions);
    }
    if (main) {
        subscriptionPackageMain = mainConnection.model('SubscriptionPackage', subscriptionPackageSchema);
    }
    if (lean) {
        subscriptionPackageLean = mainConnectionLean.model('SubscriptionPackage', subscriptionPackageSchema);
    }
};
//# sourceMappingURL=subscription-package.model.js.map