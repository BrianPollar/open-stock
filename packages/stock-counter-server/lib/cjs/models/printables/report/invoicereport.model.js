"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicesReportModel = exports.invoicesReportSelect = exports.invoicesReportLean = exports.invoicesReportMain = void 0;
/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const invoicesReportSchema = new mongoose_1.Schema({
    urId: { type: String, unique: true },
    totalAmount: { type: Number },
    date: { type: Date },
    invoices: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to invoicesReportSchema.
invoicesReportSchema.plugin(uniqueValidator);
/** primary selection object
 * for invoicesReport
 */
const invoicesReportselect = {
    urId: 1,
    totalAmount: 1,
    date: 1,
    invoices: 1
};
/** primary selection object
 * for invoicesReport
 */
/** */
exports.invoicesReportSelect = invoicesReportselect;
/** */
const createInvoicesReportModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
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