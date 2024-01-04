"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceModel = exports.invoiceSelect = exports.invoiceLean = exports.invoiceMain = void 0;
/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const invoiceSchema = new mongoose_1.Schema({
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    invoiceRelated: { type: String },
    dueDate: { type: Date }
}, { timestamps: true });
/** primary selection object
 * for invoice
 */
const invoiceselect = {
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
 * @param main Whether to create the main invoice model.
 * @param lean Whether to create the lean invoice model.
 */
const createInvoiceModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
    }
    if (main) {
        exports.invoiceMain = database_controller_1.mainConnection.model('Invoice', invoiceSchema);
    }
    if (lean) {
        exports.invoiceLean = database_controller_1.mainConnectionLean.model('Invoice', invoiceSchema);
    }
};
exports.createInvoiceModel = createInvoiceModel;
//# sourceMappingURL=invoice.model.js.map