"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceModel = exports.invoiceSelect = exports.invoiceLean = exports.invoiceMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../utils/database");
const invoiceSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withCompanySchemaObj,
    invoiceRelated: { type: String },
    dueDate: { type: Date }
}, { timestamps: true, collection: 'invoices' });
invoiceSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
invoiceSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for invoice
 */
const invoiceselect = {
    trackEdit: 1,
    trackView: 1,
    companyId: 1,
    invoiceRelated: 1,
    dueDate: 1
};
/**
 * Represents the invoice select function.
 */
exports.invoiceSelect = invoiceselect;
/**
 * Creates an invoice model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main invoice model.
 * @param lean Whether to create the lean invoice model.
 */
const createInvoiceModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(invoiceSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.invoiceMain = database_1.mainConnection.model('Invoice', invoiceSchema);
    }
    if (lean) {
        exports.invoiceLean = database_1.mainConnectionLean.model('Invoice', invoiceSchema);
    }
};
exports.createInvoiceModel = createInvoiceModel;
//# sourceMappingURL=invoice.model.js.map