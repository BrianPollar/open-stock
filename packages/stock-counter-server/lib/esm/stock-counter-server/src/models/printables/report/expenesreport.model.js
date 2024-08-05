import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
/** Mongoose schema for the expense report document. */
const expenseReportSchema = new Schema({
    trackEdit: { type: Schema.ObjectId },
    trackView: { type: Schema.ObjectId },
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    totalAmount: { type: Number },
    date: { type: Date },
    expenses: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to expenseReportSchema.
expenseReportSchema.plugin(uniqueValidator);
/** Primary selection object for expense report document. */
const expenseReportselect = {
    trackEdit: 1,
    trackView: 1,
    urId: 1,
    companyId: 1,
    totalAmount: 1,
    date: 1,
    expenses: 1
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
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        expenseReportMain = mainConnection.model('expenseReport', expenseReportSchema);
    }
    if (lean) {
        expenseReportLean = mainConnectionLean.model('expenseReport', expenseReportSchema);
    }
};
//# sourceMappingURL=expenesreport.model.js.map