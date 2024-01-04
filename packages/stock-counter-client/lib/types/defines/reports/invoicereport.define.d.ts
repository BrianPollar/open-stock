import { Invoice } from '../invoice.define';
import { DatabaseAuto, IinvoicesReport, Isuccess } from '@open-stock/stock-universal';
/**
 * InvoiceReport  class: This class represents an invoice report object.
 * It extends the  DatabaseAuto  class (not provided in the code) and has properties such as  urId ,  totalAmount ,  date , and  invoices .
 * It also has a constructor that initializes these properties based on the provided data
 */
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
    /**
     * Creates an instance of InvoiceReport.
     * @param {IinvoicesReport} data - The data used to initialize the properties of the invoice report
     */
    constructor(data: IinvoicesReport);
    /**
     * Retrieves multiple invoice reports from a server using an HTTP GET request.
     * @static
     * @param companyId - The ID of the company
     * @param {string} [url='getall'] - The URL of the HTTP GET request
     * @param {number} [offset=0] - The offset of the HTTP GET request
     * @param {number} [limit=0] - The limit of the HTTP GET request
     * @returns {Promise<InvoiceReport[]>} - An array of InvoiceReport instances
     */
    static getInvoiceReports(companyId: string, url?: string, offset?: number, limit?: number): Promise<InvoiceReport[]>;
    /**
     * Retrieves a single invoice report from a server using an HTTP GET request.
     * @static
     * @param companyId - The ID of the company
     * @param {string} urId - The unique identifier of the invoice report to retrieve
     * @returns {Promise<InvoiceReport>} - An InvoiceReport instance
     */
    static getOneInvoiceReport(companyId: string, urId: string): Promise<InvoiceReport>;
    /**
     * Adds a new invoice report to the server using an HTTP POST request.
     * @static
     * @param companyId - The ID of the company
     * @param {IinvoicesReport} vals - The data of the new invoice report
     * @returns {Promise<Isuccess>} - A success response
     */
    static addInvoiceReport(companyId: string, vals: IinvoicesReport): Promise<Isuccess>;
    /**
     * Deletes multiple invoice reports from the server using an HTTP PUT request.
     * @static
     * @param companyId - The ID of the company
     * @param {string[]} ids - An array of report IDs to be deleted
     * @returns {Promise<Isuccess>} - A success response
     */
    static deleteInvoiceReports(companyId: string, ids: string[]): Promise<Isuccess>;
}
