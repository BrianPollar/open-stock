"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicesReportModel = exports.invoicesReportSelect = exports.invoicesReportLean = exports.invoicesReportMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
/** Schema definition for invoicesReport */
const invoicesReportSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    totalAmount: { type: Number },
    date: { type: Date },
    invoices: [],
    currency: { type: String, default: 'USD' }
}, { timestamps: true, collection: 'invoicesreports' });
invoicesReportSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
invoicesReportSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
// Apply the uniqueValidator plugin to invoicesReportSchema.
invoicesReportSchema.plugin(uniqueValidator);
/** Primary selection object for invoicesReport */
const invoicesReportselect = {
    ...stock_universal_server_1.withUrIdAndCompanySelectObj,
    totalAmount: 1,
    date: 1,
    invoices: 1,
    currency: 1
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
    (0, stock_universal_server_1.createExpireDocIndex)(invoicesReportSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.invoicesReportMain = database_1.mainConnection.model('invoicesReport', invoicesReportSchema);
    }
    if (lean) {
        exports.invoicesReportLean = database_1.mainConnectionLean.model('invoicesReport', invoicesReportSchema);
    }
};
exports.createInvoicesReportModel = createInvoicesReportModel;
//# sourceMappingURL=invoicereport.model.js.map