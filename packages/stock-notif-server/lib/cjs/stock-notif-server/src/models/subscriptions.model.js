"use strict";
/**
 * @file This file defines the Mongoose schema and model for the subscription collection.
 * @requires mongoose
 * @requires ../controllers/database.controller
 * @requires mongoose-unique-validator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriptionModel = exports.subscriptionSelect = exports.subscriptionLean = exports.subscriptionMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
/**
 * Mongoose schema for the subscription collection.
 */
const subscriptionSchema = new mongoose_1.Schema({
    subscription: {},
    userId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });
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
 * Represents the subscription select function.
 */
exports.subscriptionSelect = subscriptionselect;
/**
 * Creates the Mongoose model for the subscription collection.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection.
 * @param lean - Whether to create the lean connection.
 */
const createSubscriptionModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isNotifDbConnected) {
        await (0, database_controller_1.connectNotifDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.subscriptionMain = database_controller_1.mainConnection.model('Subscription', subscriptionSchema);
    }
    if (lean) {
        exports.subscriptionLean = database_controller_1.mainConnectionLean.model('Subscription', subscriptionSchema);
    }
};
exports.createSubscriptionModel = createSubscriptionModel;
//# sourceMappingURL=subscriptions.model.js.map