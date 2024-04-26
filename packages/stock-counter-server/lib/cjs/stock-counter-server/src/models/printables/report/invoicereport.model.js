"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicesReportModel = exports.invoicesReportSelect = exports.invoicesReportLean = exports.invoicesReportMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
/** Schema definition for invoicesReport */
const invoicesReportSchema = new mongoose_1.Schema({
    urId: { type: String },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    totalAmount: { type: Number },
    date: { type: Date },
    invoices: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to invoicesReportSchema.
invoicesReportSchema.plugin(uniqueValidator);
/** Primary selection object for invoicesReport */
const invoicesReportselect = {
    urId: 1,
    companyId: 1,
    totalAmount: 1,
    date: 1,
    invoices: 1
};
/**
 * Select statement for generating invoices report.
 */
exports.invoicesReportSelect = invoicesReportselect;
/**
 * Creates a new invoices report model.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection for invoicesReports Operations.
 * @param lean - Whether to create the lean connection for invoicesReports Operations.
 */
const createInvoicesReportModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.invoicesReportMain = database_controller_1.mainConnection.model('invoicesReport', invoicesReportSchema);
    }
    if (lean) {
        exports.invoicesReportLean = database_controller_1.mainConnectionLean.model('invoicesReport', invoicesReportSchema);
    }
};
exports.createInvoicesReportModel = createInvoicesReportModel;
//# sourceMappingURL=invoicereport.model.js.map