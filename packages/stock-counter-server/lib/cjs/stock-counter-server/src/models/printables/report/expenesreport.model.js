"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpenseReportModel = exports.expenseReportSelect = exports.expenseReportLean = exports.expenseReportMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
/** Mongoose schema for the expense report document. */
const expenseReportSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    totalAmount: {
        type: Number,
        min: [0, 'cannot be less than 0.']
    },
    date: { type: Date },
    expenses: [mongoose_1.Schema.Types.ObjectId],
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'expensereports' });
// Apply the uniqueValidator plugin to expenseReportSchema.
expenseReportSchema.plugin(uniqueValidator);
expenseReportSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
expenseReportSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** Primary selection object for expense report document. */
const expenseReportselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    totalAmount: 1,
    date: 1,
    expenses: 1,
    currency: 1
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
    (0, stock_universal_server_1.createExpireDocIndex)(expenseReportSchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.expenseReportMain = stock_universal_server_1.mainConnection
            .model('expenseReport', expenseReportSchema);
    }
    if (lean) {
        exports.expenseReportLean = stock_universal_server_1.mainConnectionLean
            .model('expenseReport', expenseReportSchema);
    }
};
exports.createExpenseReportModel = createExpenseReportModel;
//# sourceMappingURL=expenesreport.model.js.map