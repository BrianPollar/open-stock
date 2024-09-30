"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceSettingModel = exports.invoiceSettingSelect = exports.invoiceSettingLean = exports.invoiceSettingMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../../utils/database");
const invoiceSettingSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withCompanySchemaObj,
    generalSettings: {},
    taxSettings: {},
    bankSettings: {},
    printDetails: {}
}, { timestamps: true, collection: 'invoicesettings' });
invoiceSettingSchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
invoiceSettingSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
/** primary selection object
 * for invoiceSetting
 */
const invoiceSettingselect = {
    ...stock_universal_server_1.withCompanySelectObj,
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
    (0, stock_universal_server_1.createExpireDocIndex)(invoiceSettingSchema);
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.invoiceSettingMain = database_1.mainConnection
            .model('InvoiceSetting', invoiceSettingSchema);
    }
    if (lean) {
        exports.invoiceSettingLean = database_1.mainConnectionLean
            .model('invoiceSetting', invoiceSettingSchema);
    }
};
exports.createInvoiceSettingModel = createInvoiceSettingModel;
//# sourceMappingURL=invoicesettings.model.js.map