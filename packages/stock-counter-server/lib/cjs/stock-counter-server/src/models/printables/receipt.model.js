"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReceiptModel = exports.receiptSelect = exports.receiptLean = exports.receiptMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const receiptSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    invoiceRelated: { type: mongoose_1.Schema.Types.ObjectId },
    ammountRcievd: {
        type: Number,
        min: [0, 'cannot be less than 0.']
    },
    paymentMode: { type: String },
    type: { type: String },
    amount: {
        type: Number,
        min: [0, 'cannot be less than 0.']
    },
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.receiptMain = stock_universal_server_1.mainConnection
            .model('Receipt', receiptSchema);
    }
    if (lean) {
        exports.receiptLean = stock_universal_server_1.mainConnectionLean
            .model('Receipt', receiptSchema);
    }
};
exports.createReceiptModel = createReceiptModel;
//# sourceMappingURL=receipt.model.js.map