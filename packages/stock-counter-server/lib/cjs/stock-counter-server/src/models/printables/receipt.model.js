"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReceiptModel = exports.receiptSelect = exports.receiptLean = exports.receiptMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const receiptSchema = new mongoose_1.Schema({
    trackEdit: { type: mongoose_1.Schema.ObjectId },
    trackView: { type: mongoose_1.Schema.ObjectId },
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    invoiceRelated: { type: String },
    ammountRcievd: { type: Number },
    paymentMode: { type: String },
    type: { type: String },
    amount: { type: Number },
    date: { type: Date }
}, { timestamps: true });
// Apply the uniqueValidator plugin to receiptSchema.
receiptSchema.plugin(uniqueValidator);
/** primary selection object
 * for receipt
 */
const receiptselect = {
    trackEdit: 1,
    trackView: 1,
    urId: 1,
    companyId: 1,
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
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.receiptMain = database_controller_1.mainConnection.model('Receipt', receiptSchema);
    }
    if (lean) {
        exports.receiptLean = database_controller_1.mainConnectionLean.model('Receipt', receiptSchema);
    }
};
exports.createReceiptModel = createReceiptModel;
//# sourceMappingURL=receipt.model.js.map