import { IdeleteMany, IfilterProps, IinvoiceRelated, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from './invoice.define';
export declare class DeliveryNote extends InvoiceRelatedWithReceipt {
    urId: string;
    companyId: string;
    /**
     * Creates a new `DeliveryNote` instance.
     * @param data An object containing the data to initialize the `DeliveryNote` instance with.
     */
    constructor(data: any);
    /**
     * Retrieves a list of delivery notes from a specified URL, with optional pagination parameters for offset and limit.
     * Uses the `StockCounterClient.ehttp` object to make
     *  an HTTP GET request and returns an array of `DeliveryNote` instances.
  
     * @param url The URL to retrieve the delivery notes from. Defaults to `'getall'`.
     * @param offset The offset to use for pagination. Defaults to `0`.
     * @param limit The limit to use for pagination. Defaults to `0`.
     * @returns An array of `DeliveryNote` instances.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        deliverynotes: DeliveryNote[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        deliverynotes: DeliveryNote[];
    }>;
    /**
     * Retrieves a single delivery note by its unique identifier (`urId`).
     * Uses the `StockCounterClient.ehttp` object
     * to make an HTTP GET request and returns a single `DeliveryNote` instance.
  
     * @param urId The unique identifier of the delivery note to retrieve.
     * @returns A single `DeliveryNote` instance.
     */
    static getOne(urId: string): Promise<DeliveryNote>;
    /**
     * Adds a new delivery note to the system.
     * Takes an `invoiceRelated` object as a parameter, which is an invoice-related data structure.
     * Uses the `StockCounterClient.ehttp` object
     *  to make an HTTP POST request with the delivery note and invoice-related data, and returns a success response.
  
     * @param invoiceRelated An `invoiceRelated` object containing the data for the delivery note.
     * @returns A success response.
     */
    static add(invoiceRelated: IinvoiceRelated): Promise<IsubscriptionFeatureState>;
    /**
     * Deletes multiple delivery notes based on the provided credentials.
     * Takes an array of `credentials` objects,
     * where each object contains the necessary information to identify and delete a delivery note.
     * Uses the `StockCounterClient.ehttp` object
     * to make an HTTP PUT request with the credentials data, and returns a success response.
  
     * @param credentials An array of `credentials` objects containing the data to identify and delete the delivery notes.
     * @returns A success response.
     */
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
}
