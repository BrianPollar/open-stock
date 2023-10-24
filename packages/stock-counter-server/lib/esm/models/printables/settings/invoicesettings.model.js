import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const invoiceSettingSchema = new Schema({
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
/** main connection for invoices Operations*/
export let invoiceSettingMain;
/** lean connection for invoices Operations*/
export let invoiceSettingLean;
/** primary selection object
 * for invoice
 */
/** */
export const invoiceSettingSelect = invoiceSettingselect;
/** */
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