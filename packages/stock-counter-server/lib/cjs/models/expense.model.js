"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpenseModel = exports.expenseSelect = exports.expenseLean = exports.expenseMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const expenseSchema = new mongoose_1.Schema({
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
/** primary selection object
 * for expense
 */
/** */
exports.expenseSelect = expenseselect;
/** */
const createExpenseModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.expenseMain = database_controller_1.mainConnection.model('Expense', expenseSchema);
    }
    if (lean) {
        exports.expenseLean = database_controller_1.mainConnectionLean.model('Expense', expenseSchema);
    }
};
exports.createExpenseModel = createExpenseModel;
//# sourceMappingURL=expense.model.js.map