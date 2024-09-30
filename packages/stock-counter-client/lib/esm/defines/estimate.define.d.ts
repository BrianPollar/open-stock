import { IdeleteMany, IeditEstimate, Iestimate, IfilterProps, IinvoiceRelated, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from './invoice.define';
export declare class Estimate extends InvoiceRelatedWithReceipt {
    fromDate: Date;
    toDate: Date;
    urId: string;
    /**
     * Creates an instance of Estimate.
     * @param data - The required data to create an estimate object.
     */
    constructor(data: Required<Iestimate>);
    /**
     * Retrieves estimates from the server by making
     * a GET request to the specified URL with optional offset and limit parameters.
  
     * @param url - The URL to retrieve the estimates from.
     * @param offset - The offset to start retrieving estimates from.
     * @param limit - The maximum number of estimates to retrieve.
     * @returns An array of Estimate objects.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        estimates: Estimate[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        estimates: Estimate[];
    }>;
    /**
     * Retrieves a single estimate by its ID from the server by making a GET request.
  
     * @param estimateId - The ID of the estimate to retrieve.
     * @returns A single Estimate object.
     */
    static getOne(urId: string): Promise<Estimate>;
    /**
     * Adds a new estimate to the server by making a POST request with the estimate and invoice related data.
  
     * @param estimate - The estimate data to add.
     * @param invoiceRelated - The invoice related data to add.
     * @returns A success message.
     */
    static add(vals: IeditEstimate): Promise<IsubscriptionFeatureState>;
    /**
     * Deletes multiple estimates from the server by making a PUT request with an array of delete credentials.
  
     * @param credentials - The credentials to use for deleting the estimates.
     * @returns A success message.
     */
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    /**
     * Updates the items of an existing estimate
     *  on the server by making a PUT request with the updated items and the estimate's ID.
  
     * @param vals - The updated items to use for the estimate.
     * @returns A success message.
     */
    updatePdt(vals: IinvoiceRelated): Promise<Isuccess>;
}
