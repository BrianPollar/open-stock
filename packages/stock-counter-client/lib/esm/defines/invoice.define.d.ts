import { IdeleteMany, IeditInvoice, IfilterProps, Iinvoice, IinvoiceRelated, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
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
  
     * @param url The URL to get the invoice related to receipts from.
     * @param offset The offset to start getting invoice related to receipts from.
     * @param limit The maximum number of invoice related to receipts to get.
     * @returns An array of invoice related to receipts.
     */
    static getInvoiceRelateds(offset?: number, limit?: number): Promise<{
        count: number;
        invoiceRelateds: InvoiceRelatedWithReceipt[];
    }>;
    /**
     * Searches for invoice related to receipts.
  
     * @param searchterm The search term to use.
     * @param searchKey The search key to use.
     * @param offset The offset to start getting invoice related to receipts from.
     * @param limit The maximum number of invoice related to receipts to get.
     * @returns An array of invoice related to receipts.
     */
    static filterInvoiceRelateds(filter: IfilterProps): Promise<{
        count: number;
        invoiceRelateds: InvoiceRelatedWithReceipt[];
    }>;
    /**
     * Gets a single invoice related to a receipt.
  
     * @param _id The ID of the invoice related to the receipt.
     * @returns The invoice related to the receipt.
     */
    static getOneInvoiceRelated(_id: string): Promise<InvoiceRelatedWithReceipt>;
}
/**
 * Represents an invoice related with a receipt.
 */
export declare class Invoice extends InvoiceRelatedWithReceipt {
    dueDate: Date;
    urId: string;
    /**
     * Creates an instance of Invoice.
     * @param data - The required data to create an invoice.
     */
    constructor(data: Required<Iinvoice>);
    /**
     * Retrieves all invoices.
  
     * @param url - The URL to retrieve the invoices from.
     * @param offset - The offset to start retrieving invoices from.
     * @param limit - The maximum number of invoices to retrieve.
     * @returns An array of invoices.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        invoices: Invoice[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        invoices: Invoice[];
    }>;
    /**
     * Retrieves a single invoice.
  
     * @param invoiceId - The ID of the invoice to retrieve.
     * @returns An instance of Invoice.
     */
    static getOne(urId: string): Promise<Invoice>;
    /**
     * Adds an invoice.
  
     * @param invoice - The invoice to add.
     * @param invoiceRelated - The related invoice.
     * @returns A success message.
     */
    static add(vals: IeditInvoice): Promise<IsubscriptionFeatureState>;
    /**
     * Deletes multiple invoices.
  
     * @param credentials - The credentials to delete the invoices.
     * @returns A success message.
     */
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    /**
     * Updates an invoice.
  
     * @param updatedInvoice - The updated invoice.
     * @param invoiceRelated - The related invoice.
     * @returns A success message.
     */
    update(vals: IeditInvoice): Promise<Isuccess>;
}
