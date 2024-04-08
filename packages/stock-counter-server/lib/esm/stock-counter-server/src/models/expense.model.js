import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const expenseSchema = new Schema({
    urId: { type: String, unique: true },
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    name: { type: String, required: [true, 'cannot be empty.'], index: true },
    person: { type: String },
    cost: { type: Number, required: [true, 'cannot be empty.'], index: true },
    category: { type: String },
    items: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to expenseSchema.
expenseSchema.plugin(uniqueValidator);
/** primary selection object
 * for expense
 */
const expenseselect = {
    urId: 1,
    companyId: 1,
    name: 1,
    person: 1,
    cost: 1,
    category: 1,
    items: 1
};
/**
 * Represents the main expense model.
 */
export let expenseMain;
/**
 * Represents a lean expense model.
 */
export let expenseLean;
/**
 * Represents the expense select function.
 */
export const expenseSelect = expenseselect;
/**
 * Creates an expense model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export const createExpenseModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        expenseMain = mainConnection.model('Expense', expenseSchema);
    }
    if (lean) {
        expenseLean = mainConnectionLean.model('Expense', expenseSchema);
    }
};
//# sourceMappingURL=expense.model.js.map