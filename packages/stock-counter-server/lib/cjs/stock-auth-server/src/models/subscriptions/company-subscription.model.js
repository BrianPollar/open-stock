"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompanySubscription = exports.companySubscriptionSelect = exports.companySubscriptionLean = exports.companySubscriptionMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../../stock-counter-server/src/controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
/** company subscription schema */
const companySubscriptionSchema = new mongoose_1.Schema({
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    name: { type: String },
    ammount: { type: Number },
    duration: { type: Number },
    active: { type: Boolean, default: false },
    subscriprionId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    startDate: { type: Date, required: [true, 'cannot be empty.'], index: true },
    endDate: { type: Date, required: [true, 'cannot be empty.'], index: true },
    pesaPalorderTrackingId: { type: String, inddex: true },
    status: { type: String },
    features: []
}, { timestamps: true });
companySubscriptionSchema.index({ endDate: -1 });
// Apply the uniqueValidator plugin to companySubscriptionSchema.
companySubscriptionSchema.plugin(uniqueValidator);
/** Primary selection object for FAQ */
const companySubscriptionselect = {
    companyId: 1,
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
 * Selects the companySubscriptionselect constant from the companySubscription.model module.
 */
exports.companySubscriptionSelect = companySubscriptionselect;
/**
 * Creates a new company subscription model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
const createCompanySubscription = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.companySubscriptionMain = database_controller_1.mainConnection.model('CompanySubscription', companySubscriptionSchema);
    }
    if (lean) {
        exports.companySubscriptionLean = database_controller_1.mainConnectionLean.model('CompanySubscription', companySubscriptionSchema);
    }
};
exports.createCompanySubscription = createCompanySubscription;
//# sourceMappingURL=company-subscription.model.js.map