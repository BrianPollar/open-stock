import { createExpireDocIndex, preUpdateDocExpire, withUrIdAndCompanySchemaObj, withUrIdAndCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../utils/database';
const uniqueValidator = require('mongoose-unique-validator');
/** Mongoose schema for the expense report document. */
const expenseReportSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    totalAmount: { type: Number },
    date: { type: Date },
    expenses: [],
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'expensereports' });
// Apply the uniqueValidator plugin to expenseReportSchema.
expenseReportSchema.plugin(uniqueValidator);
expenseReportSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
expenseReportSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
/** Primary selection object for expense report document. */
const expenseReportselect = {
    ...withUrIdAndCompanySelectObj,
    totalAmount: 1,
    date: 1,
    expenses: 1,
    currency: 1
};
/**
 * Represents the main expense report model.
 */
export let expenseReportMain;
/**
 * Represents the lean version of an expense report.
 */
export let expenseReportLean;
/**
 * Represents the select statement for the expense report.
 */
export const expenseReportSelect = expenseReportselect;
/**
 * Creates a new expense report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create a main connection for expense report operations.
 * @param lean - Whether to create a lean connection for expense report operations.
 */
export const createExpenseReportModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(expenseReportSchema);
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        expenseReportMain = mainConnection
            .model('expenseReport', expenseReportSchema);
    }
    if (lean) {
        expenseReportLean = mainConnectionLean
            .model('expenseReport', expenseReportSchema);
    }
};
//# sourceMappingURL=expenesreport.model.js.map