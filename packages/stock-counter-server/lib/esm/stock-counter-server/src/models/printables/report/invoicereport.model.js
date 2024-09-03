import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../utils/database';
const uniqueValidator = require('mongoose-unique-validator');
/** Schema definition for invoicesReport */
const invoicesReportSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    totalAmount: { type: Number },
    date: { type: Date },
    invoices: [],
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'invoicesreports' });
invoicesReportSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
invoicesReportSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
// Apply the uniqueValidator plugin to invoicesReportSchema.
invoicesReportSchema.plugin(uniqueValidator);
/** Primary selection object for invoicesReport */
const invoicesReportselect = {
    ...withUrIdAndCompanySelectObj,
    totalAmount: 1,
    date: 1,
    invoices: 1,
    currency: 1
};
/**
 * Represents the main invoice report.
 */
export let invoicesReportMain;
/**
 * Represents the lean version of the invoices report model.
 */
export let invoicesReportLean;
/**
 * Select statement for generating invoices report.
 */
export const invoicesReportSelect = invoicesReportselect;
/**
 * Creates a new invoices report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection for invoicesReports Operations.
 * @param lean - Whether to create the lean connection for invoicesReports Operations.
 */
export const createInvoicesReportModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(invoicesReportSchema);
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        invoicesReportMain = mainConnection.model('invoicesReport', invoicesReportSchema);
    }
    if (lean) {
        invoicesReportLean = mainConnectionLean.model('invoicesReport', invoicesReportSchema);
    }
};
//# sourceMappingURL=invoicereport.model.js.map