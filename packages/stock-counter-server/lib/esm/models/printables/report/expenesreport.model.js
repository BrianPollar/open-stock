/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const expenseReportSchema = new Schema({
    urId: { type: String, unique: true },
    totalAmount: { type: Number },
    date: { type: Date },
    expenses: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to expenseReportSchema.
expenseReportSchema.plugin(uniqueValidator);
/** primary selection object
 * for expenseReport
 */
const expenseReportselect = {
    urId: 1,
    totalAmount: 1,
    date: 1,
    expenses: 1
};
/** main connection for expenseReports Operations*/
export let expenseReportMain;
/** lean connection for expenseReports Operations*/
export let expenseReportLean;
/** primary selection object
 * for expenseReport
 */
/** */
export const expenseReportSelect = expenseReportselect;
/** */
export const createExpenseReportModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        expenseReportMain = mainConnection.model('expenseReport', expenseReportSchema);
    }
    if (lean) {
        expenseReportLean = mainConnectionLean.model('expenseReport', expenseReportSchema);
    }
};
//# sourceMappingURL=expenesreport.model.js.map