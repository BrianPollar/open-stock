import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';
/** The  Estimate  class extends the  InvoiceRelated  class and adds two additional properties:  fromDate  and  toDate . It also has a constructor that initializes the class properties based on the provided data. */
export class Estimate extends InvoiceRelatedWithReceipt {
    constructor(data) {
        super(data);
        this.estimateId = data.estimateId;
        this.fromDate = data.fromDate;
        this.toDate = data.toDate;
    }
    /** The  getEstimates  static method retrieves estimates from the server by making a GET request to the specified URL with optional offset and limit parameters. It returns an array of  Estimate  objects. */
    static async getEstimates(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/estimate/${url}/${offset}/${limit}`);
        const estimates = await lastValueFrom(observer$);
        console.log('estimates are ', estimates);
        return estimates
            .map(val => new Estimate(val));
    }
    /** The  getOneEstimate  static method retrieves a single estimate by its ID from the server by making a GET request. It returns a single  Estimate  object.*/
    static async getOneEstimate(estimateId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/estimate/getone/${estimateId}`);
        const estimate = await lastValueFrom(observer$);
        return new Estimate(estimate);
    }
    /** The  addEstimate  static method adds a new estimate to the server by making a POST request with the estimate and invoice related data. It returns a success message. */
    static async addEstimate(estimate, invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/estimate/create', { estimate, invoiceRelated });
        return await lastValueFrom(observer$);
    }
    /** The  deleteEstimates  static method deletes multiple estimates from the server by making a PUT request with an array of delete credentials. It returns a success message. */
    static async deleteEstimates(credentials) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/estimate/deletemany', { credentials });
        return await lastValueFrom(observer$);
    }
    /** The  updateEstimatePdt  method updates the items of an existing estimate on the server by making a PUT request with the updated items and the estimate's ID. It returns a success message. */
    async updateEstimatePdt(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/estimate/updatepdt', { items: vals, id: this._id });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=estimate.define.js.map