"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompanySubscription = exports.companySubscriptionSelect = exports.companySubscriptionLean = exports.companySubscriptionMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
/** company subscription schema */
const companySubscriptionSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withCompanySchemaObj,
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
    ...stock_universal_server_1.withCompanySelectObj,
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
    (0, stock_universal_server_1.createExpireDocIndex)(companySubscriptionSchema);
    if (!database_1.isAuthDbConnected) {
        await (0, database_1.connectAuthDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.companySubscriptionMain = database_1.mainConnection.model('CompanySubscription', companySubscriptionSchema);
    }
    if (lean) {
        exports.companySubscriptionLean = database_1.mainConnectionLean.model('CompanySubscription', companySubscriptionSchema);
    }
};
exports.createCompanySubscription = createCompanySubscription;
//# sourceMappingURL=company-subscription.model.js.map