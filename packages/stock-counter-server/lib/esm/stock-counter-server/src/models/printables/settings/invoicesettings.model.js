import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withCompanySchemaObj, withCompanySelectObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const invoiceSettingSchema = new Schema({
    ...withCompanySchemaObj,
    generalSettings: {
        status: { type: String, enum: ['paid', 'pending', 'overdue', 'draft', 'unpaid', 'cancelled'] },
        currency: { type: String },
        amount: { type: String, minLength: [1, 'cannot be less than 1'] },
        defaultDueTime: { type: String },
        defaultDigitalSignature: { type: Schema.Types.ObjectId },
        defaultDigitalStamp: { type: Schema.Types.ObjectId }
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
    return preUpdateDocExpire(this, next);
});
invoiceSettingSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
/** primary selection object
 * for invoiceSetting
 */
const invoiceSettingselect = {
    ...withCompanySelectObj,
    generalSettings: 1,
    taxSettings: 1,
    bankSettings: 1,
    printDetails: 1
};
/** main connection for invoices Operations */
export let invoiceSettingMain;
/** lean connection for invoices Operations */
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
export const createInvoiceSettingModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(invoiceSettingSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        invoiceSettingMain = mainConnection
            .model('InvoiceSetting', invoiceSettingSchema);
    }
    if (lean) {
        invoiceSettingLean = mainConnectionLean
            .model('invoiceSetting', invoiceSettingSchema);
    }
};
//# sourceMappingURL=invoicesettings.model.js.map