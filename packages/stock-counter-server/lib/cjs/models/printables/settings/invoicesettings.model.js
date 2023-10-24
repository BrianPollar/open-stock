"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceSettingModel = exports.invoiceSettingSelect = exports.invoiceSettingLean = exports.invoiceSettingMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const invoiceSettingSchema = new mongoose_1.Schema({
    generalSettings: {},
    taxSettings: {},
    bankSettings: {}
}, { timestamps: true });
/** primary selection object
 * for invoiceSetting
 */
const invoiceSettingselect = {
    generalSettings: 1,
    taxSettings: 1,
    bankSettings: 1
};
/** primary selection object
 * for invoice
 */
/** */
exports.invoiceSettingSelect = invoiceSettingselect;
/** */
const createInvoiceSettingModel = async (dbUrl, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl);
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