"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpenseReportModel = exports.expenseReportSelect = exports.expenseReportLean = exports.expenseReportMain = void 0;
/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const expenseReportSchema = new mongoose_1.Schema({
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
/** primary selection object
 * for expenseReport
 */
/** */
exports.expenseReportSelect = expenseReportselect;
/** */
const createExpenseReportModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
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