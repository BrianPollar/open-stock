/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
const invoiceSchema = new Schema({
    invoiceRelated: { type: String },
    dueDate: { type: Date }
}, { timestamps: true });
/** primary selection object
 * for invoice
 */
const invoiceselect = {
    invoiceRelated: 1,
    dueDate: 1
};
/** main connection for invoices Operations*/
export let invoiceMain;
/** lean connection for invoices Operations*/
export let invoiceLean;
/** primary selection object
 * for invoice
 */
/** */
export const invoiceSelect = invoiceselect;
/** */
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