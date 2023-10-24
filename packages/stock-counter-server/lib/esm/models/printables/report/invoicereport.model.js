import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
/** Schema definition for invoicesReport */
const invoicesReportSchema = new Schema({
    urId: { type: String, unique: true },
    totalAmount: { type: Number },
    date: { type: Date },
    invoices: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to invoicesReportSchema.
invoicesReportSchema.plugin(uniqueValidator);
/** Primary selection object for invoicesReport */
const invoicesReportselect = {
    urId: 1,
    totalAmount: 1,
    date: 1,
    invoices: 1
};
/** Main connection for invoicesReports Operations */
export let invoicesReportMain;
/** Lean connection for invoicesReports Operations */
export let invoicesReportLean;
/** Primary selection object for invoicesReport */
export const invoicesReportSelect = invoicesReportselect;
/**
 * Creates a new invoices report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection for invoicesReports Operations.
 * @param lean - Whether to create the lean connection for invoicesReports Operations.
 */
export const createInvoicesReportModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        invoicesReportMain = mainConnection.model('invoicesReport', invoicesReportSchema);
    }
    if (lean) {
        invoicesReportLean = mainConnectionLean.model('invoicesReport', invoicesReportSchema);
    }
};
//# sourceMappingURL=invoicereport.model.js.map