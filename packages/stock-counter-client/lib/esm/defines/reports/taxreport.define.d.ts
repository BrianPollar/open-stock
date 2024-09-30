import { DatabaseAuto, IdeleteMany, IfilterProps, Isuccess, ItaxReport } from '@open-stock/stock-universal';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
export declare class TaxReport extends DatabaseAuto {
    /** A string representing the unique identifier of the tax report. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** A number representing the total amount of the tax report. */
    totalAmount: number;
    /** A Date object representing the date of the tax report. */
    date: Date;
    /** An array of Estimate objects representing the estimates related to the tax report. */
    estimates: Estimate[];
    /** An array of InvoiceRelatedWithReceipt objects representing the invoice-related information of the tax report. */
    invoiceRelateds: InvoiceRelatedWithReceipt[];
    readonly currency: string;
    /**
     * TaxReport constructor: The constructor accepts an object (data) that implements the ItaxReport interface.
     * It initializes the properties of the TaxReport instance based on the provided data.
     * @param data An object that implements the ItaxReport interface.
     */
    constructor(data: ItaxReport);
    /**
     * Retrieves multiple tax reports from the server.
  
     * @param url Optional parameter for the URL of the request.
     * @param offset Optional parameter for the offset of the request.
     * @param limit Optional parameter for the limit of the request.
     * @returns An array of TaxReport instances.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        taxreports: TaxReport[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        taxreports: TaxReport[];
    }>;
    /**
     * Retrieves a single tax report from the server based on the provided unique identifier (urId).
  
     * @param urId A string representing the unique identifier of the tax report.
     * @returns A TaxReport instance.
     */
    static getOne(urId: string): Promise<TaxReport>;
    /**
     * Adds a new tax report to the server.
  
     * @param vals An object that implements the ItaxReport interface.
     * @returns A success response.
     */
    static add(vals: ItaxReport): Promise<Isuccess>;
    /**
     * Deletes multiple tax reports from the server based on the provided array of unique identifiers (_ids).
  
     * @param _ids An array of strings representing the unique identifiers of the tax reports to be deleted.
     * @returns A success response.
     */
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
