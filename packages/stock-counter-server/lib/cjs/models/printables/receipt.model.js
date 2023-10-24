"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReceiptModel = exports.receiptSelect = exports.receiptLean = exports.receiptMain = void 0;
/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const receiptSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
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
    urId: 1,
    invoiceRelated: 1,
    ammountRcievd: 1,
    paymentMode: 1,
    type: 1,
    amount: 1,
    date: 1
};
/** primary selection object
 * for receipt
 */
/** */
exports.receiptSelect = receiptselect;
/** */
const createReceiptModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
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