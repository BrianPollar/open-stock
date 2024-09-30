import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';
export class DeliveryNote extends InvoiceRelatedWithReceipt {
    /**
     * Creates a new `DeliveryNote` instance.
     * @param data An object containing the data to initialize the `DeliveryNote` instance with.
     */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
    }
    /**
     * Retrieves a list of delivery notes from a specified URL, with optional pagination parameters for offset and limit.
     * Uses the `StockCounterClient.ehttp` object to make
     *  an HTTP GET request and returns an array of `DeliveryNote` instances.
  
     * @param url The URL to retrieve the delivery notes from. Defaults to `'getall'`.
     * @param offset The offset to use for pagination. Defaults to `0`.
     * @param limit The limit to use for pagination. Defaults to `0`.
     * @returns An array of `DeliveryNote` instances.
     */
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverynote/all/${offset}/${limit}`);
        const deliverynotes = await lastValueFrom(observer$);
        return {
            count: deliverynotes.count,
            deliverynotes: deliverynotes.data
                .map((val) => new DeliveryNote(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/deliverynote/filter', filter);
        const deliverynotes = await lastValueFrom(observer$);
        return {
            count: deliverynotes.count,
            deliverynotes: deliverynotes.data
                .map((val) => new DeliveryNote(val))
        };
    }
    /**
     * Retrieves a single delivery note by its unique identifier (`urId`).
     * Uses the `StockCounterClient.ehttp` object
     * to make an HTTP GET request and returns a single `DeliveryNote` instance.
  
     * @param urId The unique identifier of the delivery note to retrieve.
     * @returns A single `DeliveryNote` instance.
     */
    static async getOne(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverynote/one/${urId}`);
        const deliverynote = await lastValueFrom(observer$);
        return new DeliveryNote(deliverynote);
    }
    /**
     * Adds a new delivery note to the system.
     * Takes an `invoiceRelated` object as a parameter, which is an invoice-related data structure.
     * Uses the `StockCounterClient.ehttp` object
     *  to make an HTTP POST request with the delivery note and invoice-related data, and returns a success response.
  
     * @param invoiceRelated An `invoiceRelated` object containing the data for the delivery note.
     * @returns A success response.
     */
    static add(invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/deliverynote/add', invoiceRelated);
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple delivery notes based on the provided credentials.
     * Takes an array of `credentials` objects,
     * where each object contains the necessary information to identify and delete a delivery note.
     * Uses the `StockCounterClient.ehttp` object
     * to make an HTTP PUT request with the credentials data, and returns a success response.
  
     * @param credentials An array of `credentials` objects containing the data to identify and delete the delivery notes.
     * @returns A success response.
     */
    static removeMany(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/deliverynote/delete/many', val); // TODO with IdeleteMany
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=deliverynote.define.js.map