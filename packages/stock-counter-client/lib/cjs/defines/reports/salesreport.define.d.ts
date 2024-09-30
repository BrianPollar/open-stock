import { DatabaseAuto, IdeleteMany, IfilterProps, IsalesReport, Isuccess } from '@open-stock/stock-universal';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
export declare class SalesReport extends DatabaseAuto {
    urId: string;
    /** The user's company ID. */
    companyId: string;
    totalAmount: number;
    date: Date;
    estimates: Estimate[];
    invoiceRelateds: InvoiceRelatedWithReceipt[];
    readonly currency: string;
    constructor(data: IsalesReport);
    /**
     * Retrieves multiple sales reports from the server.
  
     * @param url Optional parameter for the URL of the request.
     * @param offset Optional parameter for the offset of the request.
     * @param limit Optional parameter for the limit of the request.
     * @returns An array of `SalesReport` instances.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        salesreports: SalesReport[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        salesreports: SalesReport[];
    }>;
    /**
     * Retrieves a single sales report from the server.
  
     * @param urId The ID of the report to retrieve.
     * @returns A `SalesReport` instance.
     */
    static getOne(urId: string): Promise<SalesReport>;
    /**
     * Adds a new sales report to the server.
  
     * @param vals An object that represents the data of the new report.
     * @returns An `Isuccess` object.
     */
    static add(vals: IsalesReport): Promise<Isuccess>;
    /**
     * Deletes multiple sales reports from the server.
  
     * @param _ids An array of IDs of the reports to delete.
     * @returns An `Isuccess` object.
     */
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
