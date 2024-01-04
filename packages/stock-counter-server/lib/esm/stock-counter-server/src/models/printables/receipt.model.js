/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const receiptSchema = new Schema({
    urId: { type: String, unique: true },
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
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
    companyId: 1,
    invoiceRelated: 1,
    ammountRcievd: 1,
    paymentMode: 1,
    type: 1,
    amount: 1,
    date: 1
};
/**
 * Represents the main receipt model.
 */
export let receiptMain;
/**
 * Represents a lean receipt model.
 */
export let receiptLean;
/**
 * Represents the receipt select function.
 */
export const receiptSelect = receiptselect;
/**
 * Creates a new receipt model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createReceiptModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        receiptMain = mainConnection.model('Receipt', receiptSchema);
    }
    if (lean) {
        receiptLean = mainConnectionLean.model('Receipt', receiptSchema);
    }
};
//# sourceMappingURL=receipt.model.js.map