"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriptionPackageModel = exports.companySubscriptionSelect = exports.companySubscriptionLean = exports.companySubscriptionMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
/** FAQ schema */
const companySubscriptionSchema = new mongoose_1.Schema({
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
 * Selects the companySubscriptionselect constant from the companySubscription.model module.
 */
exports.companySubscriptionSelect = companySubscriptionselect;
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
        exports.companySubscriptionMain = database_controller_1.mainConnection.model('Faq', companySubscriptionSchema);
    }
    if (lean) {
        exports.companySubscriptionLean = database_controller_1.mainConnectionLean.model('Faq', companySubscriptionSchema);
    }
};
exports.createSubscriptionPackageModel = createSubscriptionPackageModel;
//# sourceMappingURL=company-subscription.model.js.map