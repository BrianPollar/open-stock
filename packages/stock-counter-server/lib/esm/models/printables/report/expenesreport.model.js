import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
/** Mongoose schema for the expense report document. */
const expenseReportSchema = new Schema({
    urId: { type: String, unique: true },
    totalAmount: { type: Number },
    date: { type: Date },
    expenses: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to expenseReportSchema.
expenseReportSchema.plugin(uniqueValidator);
/** Primary selection object for expense report document. */
const expenseReportselect = {
    urId: 1,
    totalAmount: 1,
    date: 1,
    expenses: 1
};
/** Main connection for expense report operations. */
export let expenseReportMain;
/** Lean connection for expense report operations. */
export let expenseReportLean;
/** Primary selection object for expense report document. */
export const expenseReportSelect = expenseReportselect;
/**
 * Creates a new expense report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create a main connection for expense report operations.
 * @param lean - Whether to create a lean connection for expense report operations.
 */
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