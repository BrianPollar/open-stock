import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const receiptSchema = new Schema({
    trackEdit: { type: Schema.ObjectId },
    trackView: { type: Schema.ObjectId },
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
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createReceiptModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        receiptMain = mainConnection.model('Receipt', receiptSchema);
    }
    if (lean) {
        receiptLean = mainConnectionLean.model('Receipt', receiptSchema);
    }
};
//# sourceMappingURL=receipt.model.js.map