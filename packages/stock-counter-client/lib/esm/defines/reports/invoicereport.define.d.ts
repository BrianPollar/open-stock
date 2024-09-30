import { DatabaseAuto, IdeleteMany, IfilterProps, IinvoicesReport, Isuccess } from '@open-stock/stock-universal';
import { Invoice } from '../invoice.define';
export declare class InvoiceReport extends DatabaseAuto {
    /** The unique identifier of the invoice report */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The total amount of the invoice report */
    totalAmount: number;
    /** The date of the invoice report */
    date: Date;
    /** The list of invoices included in the invoice report */
    invoices: Invoice[];
    readonly currency: string;
    /**
     * Creates an instance of InvoiceReport.
     * @param {IinvoicesReport} data - The data used to initialize the properties of the invoice report
     */
    constructor(data: IinvoicesReport);
    /**
     * Retrieves multiple invoice reports from a server using an HTTP GET request.
     * @static
  
     * @param {string} [url='getall'] - The URL of the HTTP GET request
     * @param {number} [offset=0] - The offset of the HTTP GET request
     * @param {number} [limit=0] - The limit of the HTTP GET request
     * @returns {Promise<InvoiceReport[]>} - An array of InvoiceReport instances
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        invoicesreports: InvoiceReport[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        invoicesreports: InvoiceReport[];
    }>;
    /**
     * Retrieves a single invoice report from a server using an HTTP GET request.
     * @static
  
     * @param {string} urId - The unique identifier of the invoice report to retrieve
     * @returns {Promise<InvoiceReport>} - An InvoiceReport instance
     */
    static getOne(urId: string): Promise<InvoiceReport>;
    /**
     * Adds a new invoice report to the server using an HTTP POST request.
     * @static
  
     * @param {IinvoicesReport} vals - The data of the new invoice report
     * @returns {Promise<Isuccess>} - A success response
     */
    static add(vals: IinvoicesReport): Promise<Isuccess>;
    /**
     * Deletes multiple invoice reports from the server using an HTTP PUT request.
     * @static
  
     * @param {string[]} _ids - An array of report IDs to be deleted
     * @returns {Promise<Isuccess>} - A success response
     */
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
