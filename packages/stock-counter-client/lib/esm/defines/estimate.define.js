import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';
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
        this.urId = data.urId;
    }
    /**
     * Retrieves estimates from the server by making
     * a GET request to the specified URL with optional offset and limit parameters.
  
     * @param url - The URL to retrieve the estimates from.
     * @param offset - The offset to start retrieving estimates from.
     * @param limit - The maximum number of estimates to retrieve.
     * @returns An array of Estimate objects.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/estimate/all/${offset}/${limit}`);
        const estimates = await lastValueFrom(observer$);
        return {
            count: estimates.count,
            estimates: estimates.data
                .map(val => new Estimate(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/estimate/filter', filter);
        const estimates = await lastValueFrom(observer$);
        return {
            count: estimates.count,
            estimates: estimates.data
                .map(val => new Estimate(val))
        };
    }
    /**
     * Retrieves a single estimate by its ID from the server by making a GET request.
  
     * @param estimateId - The ID of the estimate to retrieve.
     * @returns A single Estimate object.
     */
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/estimate/one/${urId}`);
        const estimate = await lastValueFrom(observer$);
        return new Estimate(estimate);
    }
    /**
     * Adds a new estimate to the server by making a POST request with the estimate and invoice related data.
  
     * @param estimate - The estimate data to add.
     * @param invoiceRelated - The invoice related data to add.
     * @returns A success message.
     */
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/estimate/add', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple estimates from the server by making a PUT request with an array of delete credentials.
  
     * @param credentials - The credentials to use for deleting the estimates.
     * @returns A success message.
     */
    static removeMany(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/estimate/delete/many', val);
        return lastValueFrom(observer$);
    }
    /**
     * Updates the items of an existing estimate
     *  on the server by making a PUT request with the updated items and the estimate's ID.
  
     * @param vals - The updated items to use for the estimate.
     * @returns A success message.
     */
    updatePdt(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/estimate/updatepdt', { items: vals, _id: this._id });
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=estimate.define.js.map