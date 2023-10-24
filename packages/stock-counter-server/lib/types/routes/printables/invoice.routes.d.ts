import { Iinvoice, IinvoiceRelated, Isuccess } from '@open-stock/stock-universal';
import { EmailHandler } from '@open-stock/stock-notif-server';
/**
 * Saves an invoice and its related information to the database.
 * @param invoice - The invoice to be saved.
 * @param invoiceRelated - The related information of the invoice.
 * @param notifRedirectUrl - The URL to redirect to after sending a notification.
 * @param localMailHandler - The email handler to use for sending notifications.
 * @returns A promise that resolves to an object containing the success status and the IDs of the saved invoice and related information.
 */
/**
 * Saves an invoice and its related information to the database.
 * @param invoice - The invoice object to be saved.
 * @param invoiceRelated - The related information of the invoice.
 * @param notifRedirectUrl - The URL to redirect to after notification.
 * @param localMailHandler - The email handler to use for local emails.
 * @returns A promise that resolves to an object containing the success status, the ID of the saved invoice, and the ID of the related information.
 */
export declare const saveInvoice: (invoice: Iinvoice, invoiceRelated: Required<IinvoiceRelated>, notifRedirectUrl: string, localMailHandler: EmailHandler) => Promise<Isuccess & {
    id?: string;
    invoiceRelatedId?: string;
}>;
/** Router for invoice routes */
export declare const invoiceRoutes: any;
