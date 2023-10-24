import { Iinvoice, IinvoiceRelated, Isuccess } from '@open-stock/stock-universal';
import { EmailHandler } from '@open-stock/stock-notif-server';
/** */
export declare const saveInvoice: (invoice: Iinvoice, invoiceRelated: Required<IinvoiceRelated>, notifRedirectUrl: string, localMailHandler: EmailHandler) => Promise<Isuccess & {
    id?: string;
    invoiceRelatedId?: string;
}>;
/** */
export declare const invoiceRoutes: any;
