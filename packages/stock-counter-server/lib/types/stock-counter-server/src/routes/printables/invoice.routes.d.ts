import { Iinvoice, IinvoiceRelated, Isuccess } from '@open-stock/stock-universal';
/**
 * Saves an invoice along with its related information.
 * @param invoice - The invoice to be saved.
 * @param invoiceRelated - The related information of the invoice.
 * @param queryId - The ID of the company associated with the invoice.
 * @returns A promise that resolves to an object containing the success status,
 *          the ID of the saved invoice, and the ID of the related information.
 */
export declare const saveInvoice: (invoice: Iinvoice, invoiceRelated: Required<IinvoiceRelated>, queryId: string) => Promise<Isuccess & {
    id?: string;
    invoiceRelatedId?: string;
}>;
/**
 * Router for handling invoice routes.
 */
export declare const invoiceRoutes: any;
