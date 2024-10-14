"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicesReportModel = exports.invoicesReportSelect = exports.invoicesReportLean = exports.invoicesReportMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
/** Schema definition for invoicesReport */
const invoicesReportSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withUrIdAndCompanySchemaObj,
    totalAmount: {
        type: Number,
        min: [0, 'cannot be less than 0.']
    },
    date: { type: Date },
    invoices: [mongoose_1.Schema.Types.ObjectId],
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.invoicesReportMain = stock_universal_server_1.mainConnection
            .model('invoicesReport', invoicesReportSchema);
    }
    if (lean) {
        exports.invoicesReportLean = stock_universal_server_1.mainConnectionLean
            .model('invoicesReport', invoicesReportSchema);
    }
};
exports.createInvoicesReportModel = createInvoicesReportModel;
//# sourceMappingURL=invoicereport.model.js.map