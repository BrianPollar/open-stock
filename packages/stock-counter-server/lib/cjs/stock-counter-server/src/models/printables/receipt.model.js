"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReceiptModel = exports.receiptSelect = exports.receiptLean = exports.receiptMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const receiptSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    invoiceRelated: { type: String },
    ammountRcievd: { type: Number },
    paymentMode: { type: String },
    type: { type: String },
    amount: { type: Number },
    date: { type: Date }
}, { timestamps: true, collection: 'receipts' });
receiptSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
receiptSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to receiptSchema.
receiptSchema.plugin(uniqueValidator);
/** primary selection object
 * for receipt
 */
const receiptselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    invoiceRelated: 1,
    ammountRcievd: 1,
    paymentMode: 1,
    type: 1,
    amount: 1,
    date: 1
};
/**
 * Represents the receipt select function.
 */
exports.receiptSelect = receiptselect;
/**
 * Creates a new receipt model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
const createReceiptModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(receiptSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.receiptMain = database_1.mainConnection
            .model('Receipt', receiptSchema);
    }
    if (lean) {
        exports.receiptLean = database_1.mainConnectionLean
            .model('Receipt', receiptSchema);
    }
};
exports.createReceiptModel = createReceiptModel;
//# sourceMappingURL=receipt.model.js.map