"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriptionPackageModel = exports.subscriptionPackageSelect = exports.subscriptionPackageLean = exports.subscriptionPackageMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
/** FAQ schema */
const subscriptionPackageSchema = new mongoose_1.Schema({
    name: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    ammount: { type: Number, unique: true, required: [true, 'cannot be empty.'], index: true },
    duration: { type: Number, required: [true, 'cannot be empty.'], index: true },
    active: { type: Boolean, required: [true, 'cannot be empty.'], index: true },
    features: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to subscriptionPackageSchema.
subscriptionPackageSchema.plugin(uniqueValidator);
/** Primary selection object for FAQ */
const subscriptionPackageselect = {
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
 * Creates a new FAQ model.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
const createSubscriptionPackageModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.subscriptionPackageMain = database_controller_1.mainConnection.model('Faq', subscriptionPackageSchema);
    }
    if (lean) {
        exports.subscriptionPackageLean = database_controller_1.mainConnectionLean.model('Faq', subscriptionPackageSchema);
    }
};
exports.createSubscriptionPackageModel = createSubscriptionPackageModel;
//# sourceMappingURL=subscription-package.model.js.map