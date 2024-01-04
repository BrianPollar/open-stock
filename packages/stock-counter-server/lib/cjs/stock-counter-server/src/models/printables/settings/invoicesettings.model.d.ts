/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceSetting } from '@open-stock/stock-universal';
/** model type for invoiceSetting by */
export type TinvoiceSetting = Document & IinvoiceSetting;
/** main connection for invoices Operations*/
export declare let invoiceSettingMain: Model<TinvoiceSetting>;
/** lean connection for invoices Operations*/
export declare let invoiceSettingLean: Model<TinvoiceSetting>;
/** primary selection object
 * for invoice
 */
export declare const invoiceSettingSelect: {
    companyId: number;
    generalSettings: number;
    taxSettings: number;
    bankSettings: number;
};
/**
 * Creates an instance of the InvoiceSetting model.
 * @param {string} dbUrl - The URL of the database to connect to.
 * @param {boolean} [main=true] - Whether to create the main connection model.
 * @param {boolean} [lean=true] - Whether to create the lean connection model.
 * @returns {Promise<void>} - A promise that resolves when the model is created.
 */
export declare const createInvoiceSettingModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
