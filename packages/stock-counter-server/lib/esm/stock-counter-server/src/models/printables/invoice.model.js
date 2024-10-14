import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire, withUrIdAndCompanySchemaObj } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const invoiceSchema = new Schema({
    ...withUrIdAndCompanySchemaObj,
    invoiceRelated: { type: Schema.Types.ObjectId },
    dueDate: { type: Date }
}, { timestamps: true, collection: 'invoices' });
invoiceSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
invoiceSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
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
 * Represents the main invoice model.
 */
export let invoiceMain;
/**
 * Represents a lean invoice model.
 */
export let invoiceLean;
/**
 * Represents the invoice select function.
 */
export const invoiceSelect = invoiceselect;
/**
 * Creates an invoice model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main invoice model.
 * @param lean Whether to create the lean invoice model.
 */
export const createInvoiceModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(invoiceSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        invoiceMain = mainConnection
            .model('Invoice', invoiceSchema);
    }
    if (lean) {
        invoiceLean = mainConnectionLean
            .model('Invoice', invoiceSchema);
    }
};
//# sourceMappingURL=invoice.model.js.map