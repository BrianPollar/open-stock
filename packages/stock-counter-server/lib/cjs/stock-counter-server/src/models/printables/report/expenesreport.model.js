"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpenseReportModel = exports.expenseReportSelect = exports.expenseReportLean = exports.expenseReportMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
/** Mongoose schema for the expense report document. */
const expenseReportSchema = new mongoose_1.Schema({
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
    urId: 1,
    companyId: 1,
    totalAmount: 1,
    date: 1,
    expenses: 1
};
/**
 * Represents the select statement for the expense report.
 */
exports.expenseReportSelect = expenseReportselect;
/**
 * Creates a new expense report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create a main connection for expense report operations.
 * @param lean - Whether to create a lean connection for expense report operations.
 */
const createExpenseReportModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.expenseReportMain = database_controller_1.mainConnection.model('expenseReport', expenseReportSchema);
    }
    if (lean) {
        exports.expenseReportLean = database_controller_1.mainConnectionLean.model('expenseReport', expenseReportSchema);
    }
};
exports.createExpenseReportModel = createExpenseReportModel;
//# sourceMappingURL=expenesreport.model.js.map