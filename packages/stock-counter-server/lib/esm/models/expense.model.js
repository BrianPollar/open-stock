import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const expenseSchema = new Schema({
    urId: { type: String, unique: true },
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
    name: 1,
    person: 1,
    cost: 1,
    category: 1,
    items: 1
};
/** main connection for expenses Operations*/
export let expenseMain;
/** lean connection for expenses Operations*/
export let expenseLean;
/** primary selection object
 * for expense
 */
/** */
export const expenseSelect = expenseselect;
/** */
export const createExpenseModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        expenseMain = mainConnection.model('Expense', expenseSchema);
    }
    if (lean) {
        expenseLean = mainConnectionLean.model('Expense', expenseSchema);
    }
};
//# sourceMappingURL=expense.model.js.map