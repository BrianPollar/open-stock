/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IinvoiceSetting } from '@open-stock/stock-universal';
/** model type for invoiceSetting by */
/** */
export type TinvoiceSetting = Document & IinvoiceSetting;
/** main connection for invoices Operations*/
export declare let invoiceSettingMain: Model<TinvoiceSetting>;
/** lean connection for invoices Operations*/
export declare let invoiceSettingLean: Model<TinvoiceSetting>;
/** primary selection object
 * for invoice
 */
/** */
export declare const invoiceSettingSelect: {
    generalSettings: number;
    taxSettings: number;
    bankSettings: number;
};
/** */
export declare const createInvoiceSettingModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
