"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceSettingModel = exports.invoiceSettingSelect = exports.invoiceSettingLean = exports.invoiceSettingMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const invoiceSettingSchema = new mongoose_1.Schema({
    trackEdit: { type: mongoose_1.Schema.ObjectId },
    trackView: { type: mongoose_1.Schema.ObjectId },
    companyId: { type: String, required: [true, 'cannot be empty.'], index: true },
    generalSettings: {},
    taxSettings: {},
    bankSettings: {},
    printDetails: {}
}, { timestamps: true });
/** primary selection object
 * for invoiceSetting
 */
const invoiceSettingselect = {
    trackEdit: 1,
    trackView: 1,
    companyId: 1,
    generalSettings: 1,
    taxSettings: 1,
    bankSettings: 1,
    printDetails: 1
};
/** primary selection object
 * for invoice
 */
exports.invoiceSettingSelect = invoiceSettingselect;
/**
 * Creates an instance of the InvoiceSetting model.
 * @param {string} dbUrl - The URL of the database to connect to.
 * @param {boolean} [main=true] - Whether to create the main connection model.
 * @param {boolean} [lean=true] - Whether to create the lean connection model.
 * @returns {Promise<void>} - A promise that resolves when the model is created.
 */
const createInvoiceSettingModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.invoiceSettingMain = database_controller_1.mainConnection.model('InvoiceSetting', invoiceSettingSchema);
    }
    if (lean) {
        exports.invoiceSettingLean = database_controller_1.mainConnectionLean.model('invoiceSetting', invoiceSettingSchema);
    }
};
exports.createInvoiceSettingModel = createInvoiceSettingModel;
//# sourceMappingURL=invoicesettings.model.js.map