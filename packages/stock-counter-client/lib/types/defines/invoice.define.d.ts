import { IdeleteCredentialsInvRel, Iinvoice, IinvoiceRelated, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelated, Receipt } from './receipt.define';
export declare class InvoiceRelatedWithReceipt extends InvoiceRelated {
    payments: Receipt[];
    /**
     * Constructs a new instance of the Invoice class.
     * @param data The required data for the invoice.
     */
    constructor(data: Required<IinvoiceRelated>);
    /**
     * Gets all invoice related to receipts.
     * @param companyId - The ID of the company
     * @param url The URL to get the invoice related to receipts from.
     * @param offset The offset to start getting invoice related to receipts from.
     * @param limit The maximum number of invoice related to receipts to get.
     * @returns An array of invoice related to receipts.
     */
    static getInvoiceRelateds(companyId: string, url?: string, offset?: number, limit?: number): Promise<InvoiceRelatedWithReceipt[]>;
    /**
     * Searches for invoice related to receipts.
     * @param companyId - The ID of the company
     * @param searchterm The search term to use.
     * @param searchKey The search key to use.
     * @param offset The offset to start getting invoice related to receipts from.
     * @param limit The maximum number of invoice related to receipts to get.
     * @returns An array of invoice related to receipts.
     */
    static searchInvoiceRelateds(companyId: string, searchterm: string, searchKey: string, offset?: number, limit?: number): Promise<InvoiceRelatedWithReceipt[]>;
    /**
     * Gets a single invoice related to a receipt.
     * @param companyId - The ID of the company
     * @param id The ID of the invoice related to the receipt.
     * @returns The invoice related to the receipt.
     */
    static getOneInvoiceRelated(companyId: string, id: string): Promise<InvoiceRelatedWithReceipt>;
}
/**
 * Represents an invoice related with a receipt.
 */
export declare class Invoice extends InvoiceRelatedWithReceipt {
    /** The due date of the invoice. */
    dueDate: Date;
    /**
     * Creates an instance of Invoice.
     * @param data - The required data to create an invoice.
     */
    constructor(data: Required<Iinvoice>);
    /**
     * Retrieves all invoices.
     * @param companyId - The ID of the company
     * @param url - The URL to retrieve the invoices from.
     * @param offset - The offset to start retrieving invoices from.
     * @param limit - The maximum number of invoices to retrieve.
     * @returns An array of invoices.
     */
    static getInvoices(companyId: string, url?: string, offset?: number, limit?: number): Promise<Invoice[]>;
    /**
     * Retrieves a single invoice.
     * @param companyId - The ID of the company
     * @param invoiceId - The ID of the invoice to retrieve.
     * @returns An instance of Invoice.
     */
    static getOneInvoice(companyId: string, invoiceId: number): Promise<Invoice>;
    /**
     * Adds an invoice.
     * @param companyId - The ID of the company
     * @param invoice - The invoice to add.
     * @param invoiceRelated - The related invoice.
     * @returns A success message.
     */
    static addInvoice(companyId: string, invoice: Iinvoice, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /**
     * Deletes multiple invoices.
     * @param companyId - The ID of the company
     * @param credentials - The credentials to delete the invoices.
     * @returns A success message.
     */
    static deleteInvoices(companyId: string, credentials: IdeleteCredentialsInvRel[]): Promise<Isuccess>;
    /**
     * Updates an invoice.
     * @param companyId - The ID of the company
     * @param updatedInvoice - The updated invoice.
     * @param invoiceRelated - The related invoice.
     * @returns A success message.
     */
    update(companyId: string, updatedInvoice: Iinvoice, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
}
