import { Iinvoice, IinvoiceRelated, Isuccess } from '@open-stock/stock-universal';
export declare const saveInvoice: (res: any, invoice: Iinvoice, invoiceRelated: Required<IinvoiceRelated>, companyId: string) => Promise<Isuccess & {
    _id?: string;
    invoiceRelatedId?: string;
}>;
/**
 * Router for handling invoice routes.
 */
export declare const invoiceRoutes: import("express-serve-static-core").Router;
