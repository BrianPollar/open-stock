/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const invoiceSchema = new Schema({
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    invoiceRelated: { type: String },
    dueDate: { type: Date }
}, { timestamps: true });
/** primary selection object
 * for invoice
 */
const invoiceselect = {
    companyId: 1,
    invoiceRelated: 1,
    dueDate: 1
};
/**
 * Represents the main invoice model.
 */
export let invoiceMain;
/**
 * Represents a lean invoice model.
 */
export let invoiceLean;
/**
 * Represents the invoice select function.
 */
export const invoiceSelect = invoiceselect;
/**
 * Creates an invoice model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main invoice model.
 * @param lean Whether to create the lean invoice model.
 */
export const createInvoiceModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        invoiceMain = mainConnection.model('Invoice', invoiceSchema);
    }
    if (lean) {
        invoiceLean = mainConnectionLean.model('Invoice', invoiceSchema);
    }
};
//# sourceMappingURL=invoice.model.js.map