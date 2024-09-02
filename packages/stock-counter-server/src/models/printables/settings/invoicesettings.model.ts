import { IinvoiceSetting } from '@open-stock/stock-universal';
import { createExpireDocIndex, preUpdateDocExpire, withCompanySchemaObj, withCompanySelectObj } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../utils/database';

/** model type for invoiceSetting by */
export type TinvoiceSetting = Document & IinvoiceSetting;

const invoiceSettingSchema: Schema = new Schema({
  ...withCompanySchemaObj,
  generalSettings: { },
  taxSettings: { },
  bankSettings: { },
  printDetails: { }
}, { timestamps: true, collection: 'invoicesettings' });

invoiceSettingSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

invoiceSettingSchema.pre('updateMany', function(next) {
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
export let invoiceSettingMain: Model<TinvoiceSetting>;

/** lean connection for invoices Operations */
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
export const createInvoiceSettingModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(invoiceSettingSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    invoiceSettingMain = mainConnection.model<TinvoiceSetting>('InvoiceSetting', invoiceSettingSchema);
  }

  if (lean) {
    invoiceSettingLean = mainConnectionLean.model<TinvoiceSetting>('invoiceSetting', invoiceSettingSchema);
  }
};

