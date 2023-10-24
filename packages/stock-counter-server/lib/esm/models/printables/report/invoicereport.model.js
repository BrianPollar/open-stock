/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const invoicesReportSchema = new Schema({
    urId: { type: String, unique: true },
    totalAmount: { type: Number },
    date: { type: Date },
    invoices: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to invoicesReportSchema.
invoicesReportSchema.plugin(uniqueValidator);
/** primary selection object
 * for invoicesReport
 */
const invoicesReportselect = {
    urId: 1,
    totalAmount: 1,
    date: 1,
    invoices: 1
};
/** main connection for invoicesReports Operations*/
export let invoicesReportMain;
/** lean connection for invoicesReports Operations*/
export let invoicesReportLean;
/** primary selection object
 * for invoicesReport
 */
/** */
export const invoicesReportSelect = invoicesReportselect;
/** */
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