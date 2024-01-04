import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const invoiceSettingSchema = new Schema({
    companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    generalSettings: {},
    taxSettings: {},
    bankSettings: {}
}, { timestamps: true });
/** primary selection object
 * for invoiceSetting
 */
const invoiceSettingselect = {
    companyId: 1,
    generalSettings: 1,
    taxSettings: 1,
    bankSettings: 1
};
/** main connection for invoices Operations*/
export let invoiceSettingMain;
/** lean connection for invoices Operations*/
export let invoiceSettingLean;
/** primary selection object
 * for invoice
 */
export const invoiceSettingSelect = invoiceSettingselect;
/**
 * Creates an instance of the InvoiceSetting model.
 * @param {string} dbUrl - The URL of the database to connect to.
 * @param {boolean} [main=true] - Whether to create the main connection model.
 * @param {boolean} [lean=true] - Whether to create the lean connection model.
 * @returns {Promise<void>} - A promise that resolves when the model is created.
 */
export const createInvoiceSettingModel = async (dbUrl, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl);
    }
    if (main) {
        invoiceSettingMain = mainConnection.model('InvoiceSetting', invoiceSettingSchema);
    }
    if (lean) {
        invoiceSettingLean = mainConnectionLean.model('invoiceSetting', invoiceSettingSchema);
    }
};
//# sourceMappingURL=invoicesettings.model.js.map