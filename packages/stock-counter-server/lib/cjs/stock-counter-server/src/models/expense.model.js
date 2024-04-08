"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpenseModel = exports.expenseSelect = exports.expenseLean = exports.expenseMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const expenseSchema = new mongoose_1.Schema({
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
 * Represents the expense select function.
 */
exports.expenseSelect = expenseselect;
/**
 * Creates an expense model with the given database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
const createExpenseModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
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