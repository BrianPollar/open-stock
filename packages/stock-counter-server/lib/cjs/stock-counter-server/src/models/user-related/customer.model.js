"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerModel = exports.customerSelect = exports.customerLean = exports.customerMain = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const database_1 = require("../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
/** Defines the schema for the customer model. */
const customerSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    user: { type: mongoose_1.default.Types.ObjectId, unique: true, required: [true, 'cannot be empty.'], index: true },
    startDate: { type: Date },
    endDate: { type: Date },
    occupation: { type: String },
    otherAddresses: []
}, { timestamps: true, collection: 'customers' });
customerSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
customerSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to customerSchema.
customerSchema.plugin(uniqueValidator);
/** Defines the main selection object for customer. */
const customerselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    user: 1,
    salutation: 1,
    endDate: 1,
    occupation: 1,
    otherAddresses: 1
};
/**
 * Represents a customer select statement.
 */
exports.customerSelect = customerselect;
/**
 * Creates a new customer model and connects to the database.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection.
 * @param lean Whether to create the lean connection.
 */
const createCustomerModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(customerSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.customerMain = database_1.mainConnection.model('Customer', customerSchema);
    }
    if (lean) {
        exports.customerLean = database_1.mainConnectionLean.model('Customer', customerSchema);
    }
};
exports.createCustomerModel = createCustomerModel;
//# sourceMappingURL=customer.model.js.map