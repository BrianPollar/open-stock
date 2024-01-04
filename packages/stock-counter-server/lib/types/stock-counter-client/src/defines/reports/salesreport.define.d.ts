import { Estimate } from '../estimate.define';
import { DatabaseAuto, IsalesReport, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
/**
 * The `SalesReport` class represents a sales report object.
 * It extends the `DatabaseAuto` class and adds properties specific to sales reports, such as `urId`, `totalAmount`, `date`, `estimates`, and `invoiceRelateds`.
 * The constructor takes a data object that implements the `IsalesReport` interface and initializes the class properties based on the data.
 */
export declare class SalesReport extends DatabaseAuto {
    urId: string;
    /** The user's company ID. */
    companyId: string;
    totalAmount: number;
    date: Date;
    estimates: Estimate[];
    invoiceRelateds: InvoiceRelatedWithReceipt[];
    constructor(data: IsalesReport);
    /**
     * Retrieves multiple sales reports from the server.
     * @param companyId - The ID of the company
     * @param url Optional parameter for the URL of the request.
     * @param offset Optional parameter for the offset of the request.
     * @param limit Optional parameter for the limit of the request.
     * @returns An array of `SalesReport` instances.
     */
    static getSalesReports(companyId: string, url?: string, offset?: number, limit?: number): Promise<SalesReport[]>;
    /**
     * Retrieves a single sales report from the server.
     * @param companyId - The ID of the company
     * @param urId The ID of the report to retrieve.
     * @returns A `SalesReport` instance.
     */
    static getOneSalesReport(companyId: string, urId: string): Promise<SalesReport>;
    /**
     * Adds a new sales report to the server.
     * @param companyId - The ID of the company
     * @param vals An object that represents the data of the new report.
     * @returns An `Isuccess` object.
     */
    static addSalesReport(companyId: string, vals: IsalesReport): Promise<Isuccess>;
    /**
     * Deletes multiple sales reports from the server.
     * @param companyId - The ID of the company
     * @param ids An array of IDs of the reports to delete.
     * @returns An `Isuccess` object.
     */
    static deleteSalesReports(companyId: string, ids: string[]): Promise<Isuccess>;
}
