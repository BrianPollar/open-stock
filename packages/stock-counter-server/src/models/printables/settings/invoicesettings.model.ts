import { Document, Model, Schema } from 'mongoose';
import { IinvoiceSetting } from '@open-stock/stock-universal';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';

/** model type for invoiceSetting by */
export type TinvoiceSetting = Document & IinvoiceSetting;

const invoiceSettingSchema: Schema = new Schema({
  companyId: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  generalSettings: { },
  taxSettings: { },
  bankSettings: { }
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
export let invoiceSettingMain: Model<TinvoiceSetting>;
/** lean connection for invoices Operations*/
export let invoiceSettingLean: Model<TinvoiceSetting>;
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
export const createInvoiceSettingModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl);
  }

  if (main) {
    invoiceSettingMain = mainConnection.model<TinvoiceSetting>('InvoiceSetting', invoiceSettingSchema);
  }

  if (lean) {
    invoiceSettingLean = mainConnectionLean.model<TinvoiceSetting>('invoiceSetting', invoiceSettingSchema);
  }
};

