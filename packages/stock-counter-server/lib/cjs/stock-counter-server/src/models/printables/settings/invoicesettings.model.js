"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceSettingModel = exports.invoiceSettingSelect = exports.invoiceSettingLean = exports.invoiceSettingMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const invoiceSettingSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.withCompanySchemaObj,
    generalSettings: {
        status: { type: String, enum: ['paid', 'pending', 'overdue', 'draft', 'unpaid', 'cancelled'] },
        currency: { type: String },
        amount: { type: String, minLength: [1, 'cannot be less than 1'] },
        defaultDueTime: { type: String },
        defaultDigitalSignature: { type: mongoose_1.Schema.Types.ObjectId },
        defaultDigitalStamp: { type: mongoose_1.Schema.Types.ObjectId }
    },
    taxSettings: {
        taxes: { type: Array }
    },
    bankSettings: {
        enabled: { type: Boolean },
        holderName: { type: String },
        bankName: { type: String },
        ifscCode: { type: String },
        accountNumber: { type: String }
    },
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
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.invoiceSettingMain = stock_universal_server_1.mainConnection
            .model('InvoiceSetting', invoiceSettingSchema);
    }
    if (lean) {
        exports.invoiceSettingLean = stock_universal_server_1.mainConnectionLean
            .model('invoiceSetting', invoiceSettingSchema);
    }
};
exports.createInvoiceSettingModel = createInvoiceSettingModel;
//# sourceMappingURL=invoicesettings.model.js.map