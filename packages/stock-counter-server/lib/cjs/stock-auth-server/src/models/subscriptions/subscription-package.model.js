"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriptionPackageModel = exports.subscriptionPackageSelect = exports.subscriptionPackageLean = exports.subscriptionPackageMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
/** subscription package schema */
const subscriptionPackageSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.globalSchemaObj,
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
    ...stock_universal_server_1.globalSelectObj,
    name: 1,
    ammount: 1,
    duration: 1,
    active: 1,
    features: 1
};
/**
 * Selects the subscriptionPackageselect constant from the subscriptionPackage.model module.
 */
exports.subscriptionPackageSelect = subscriptionPackageselect;
/**
 * Creates a new subscription package model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
const createSubscriptionPackageModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(subscriptionPackageSchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.subscriptionPackageMain = stock_universal_server_1.mainConnection
            .model('SubscriptionPackage', subscriptionPackageSchema);
    }
    if (lean) {
        exports.subscriptionPackageLean = stock_universal_server_1.mainConnectionLean
            .model('SubscriptionPackage', subscriptionPackageSchema);
    }
};
exports.createSubscriptionPackageModel = createSubscriptionPackageModel;
//# sourceMappingURL=subscription-package.model.js.map