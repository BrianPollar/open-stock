import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';
/** The  Estimate  class extends the  InvoiceRelated  class and adds two additional properties:  fromDate  and  toDate . It also has a constructor that initializes the class properties based on the provided data. */
/**
 * Represents an estimate object that extends the InvoiceRelatedWithReceipt class.
 */
export class Estimate extends InvoiceRelatedWithReceipt {
    /**
     * Creates an instance of Estimate.
     * @param data - The required data to create an estimate object.
     */
    constructor(data) {
        super(data);
        this.estimateId = data.estimateId;
        this.fromDate = data.fromDate;
        this.toDate = data.toDate;
    }
    /**
     * Retrieves estimates from the server by making a GET request to the specified URL with optional offset and limit parameters.
     * @param companyId - The ID of the company
     * @param url - The URL to retrieve the estimates from.
     * @param offset - The offset to start retrieving estimates from.
     * @param limit - The maximum number of estimates to retrieve.
     * @returns An array of Estimate objects.
     */
    static async getEstimates(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/estimate/${url}/${offset}/${limit}/${companyId}`);
        const estimates = await lastValueFrom(observer$);
        return {
            count: estimates.count,
            estimates: estimates.data
                .map(val => new Estimate(val))
        };
    }
    /**
     * Retrieves a single estimate by its ID from the server by making a GET request.
     * @param companyId - The ID of the company
     * @param estimateId - The ID of the estimate to retrieve.
     * @returns A single Estimate object.
     */
    static async getOneEstimate(companyId, estimateId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/estimate/getone/${estimateId}`);
        const estimate = await lastValueFrom(observer$);
        return new Estimate(estimate);
    }
    /**
     * Adds a new estimate to the server by making a POST request with the estimate and invoice related data.
     * @param companyId - The ID of the company
     * @param estimate - The estimate data to add.
     * @param invoiceRelated - The invoice related data to add.
     * @returns A success message.
     */
    static async addEstimate(companyId, estimate, invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/estimate/create/${companyId}`, { estimate, invoiceRelated });
        return await lastValueFrom(observer$);
    }
    /**
     * Deletes multiple estimates from the server by making a PUT request with an array of delete credentials.
     * @param companyId - The ID of the company
     * @param credentials - The credentials to use for deleting the estimates.
     * @returns A success message.
     */
    static async deleteEstimates(companyId, credentials) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/estimate/deletemany/${companyId}`, { credentials });
        return await lastValueFrom(observer$);
    }
    /**
     * Updates the items of an existing estimate on the server by making a PUT request with the updated items and the estimate's ID.
     * @param companyId - The ID of the company
     * @param vals - The updated items to use for the estimate.
     * @returns A success message.
     */
    async updateEstimatePdt(companyId, vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/estimate/updatepdt/${companyId}`, { items: vals, id: this._id });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=estimate.define.js.map