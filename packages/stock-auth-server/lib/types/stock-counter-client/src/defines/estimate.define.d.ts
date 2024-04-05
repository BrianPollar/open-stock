import { IdeleteCredentialsInvRel, Iestimate, IinvoiceRelated, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from './invoice.define';
/** The  Estimate  class extends the  InvoiceRelated  class and adds two additional properties:  fromDate  and  toDate . It also has a constructor that initializes the class properties based on the provided data. */
/**
 * Represents an estimate object that extends the InvoiceRelatedWithReceipt class.
 */
export declare class Estimate extends InvoiceRelatedWithReceipt {
    /** The start date of the estimate. */
    fromDate: Date;
    /** The end date of the estimate. */
    toDate: Date;
    /**
     * Creates an instance of Estimate.
     * @param data - The required data to create an estimate object.
     */
    constructor(data: Required<Iestimate>);
    /**
     * Retrieves estimates from the server by making a GET request to the specified URL with optional offset and limit parameters.
     * @param companyId - The ID of the company
     * @param url - The URL to retrieve the estimates from.
     * @param offset - The offset to start retrieving estimates from.
     * @param limit - The maximum number of estimates to retrieve.
     * @returns An array of Estimate objects.
     */
    static getEstimates(companyId: string, url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        estimates: Estimate[];
    }>;
    /**
     * Retrieves a single estimate by its ID from the server by making a GET request.
     * @param companyId - The ID of the company
     * @param estimateId - The ID of the estimate to retrieve.
     * @returns A single Estimate object.
     */
    static getOneEstimate(companyId: string, estimateId: number): Promise<Estimate>;
    /**
     * Adds a new estimate to the server by making a POST request with the estimate and invoice related data.
     * @param companyId - The ID of the company
     * @param estimate - The estimate data to add.
     * @param invoiceRelated - The invoice related data to add.
     * @returns A success message.
     */
    static addEstimate(companyId: string, estimate: Iestimate, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /**
     * Deletes multiple estimates from the server by making a PUT request with an array of delete credentials.
     * @param companyId - The ID of the company
     * @param credentials - The credentials to use for deleting the estimates.
     * @returns A success message.
     */
    static deleteEstimates(companyId: string, credentials: IdeleteCredentialsInvRel[]): Promise<Isuccess>;
    /**
     * Updates the items of an existing estimate on the server by making a PUT request with the updated items and the estimate's ID.
     * @param companyId - The ID of the company
     * @param vals - The updated items to use for the estimate.
     * @returns A success message.
     */
    updateEstimatePdt(companyId: string, vals: IinvoiceRelated): Promise<Isuccess>;
}
