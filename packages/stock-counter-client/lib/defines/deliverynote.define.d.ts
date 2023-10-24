import { IdeleteCredentialsInvRel, IinvoiceRelated, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from './invoice.define';
/** DeliveryNote  class: This class extends the  InvoiceRelated  class (which is not provided) and represents a delivery note. It has a  urId  property to store the unique identifier of the delivery note. */
export declare class DeliveryNote extends InvoiceRelatedWithReceipt {
    urId: string;
    constructor(data: any);
    /** getDeliveryNotes : This method retrieves a list of delivery notes from a specified URL, with optional pagination parameters for offset and limit. It uses the  StockCounterClient.ehttp object to make an HTTP GET request and returns an array of  DeliveryNote  instances. */
    static getDeliveryNotes(url?: string, offset?: number, limit?: number): Promise<DeliveryNote[]>;
    /** getOneDeliveryNote : This method retrieves a single delivery note by its unique identifier ( urId ). It uses the  StockCounterClient.ehttp object to make an HTTP GET request and returns a single  DeliveryNote  instance. */
    static getOneDeliveryNote(urId: string): Promise<DeliveryNote>;
    /** addDeliveryNote : This method adds a new delivery note to the system. It takes an  invoiceRelated  object as a parameter, which is an invoice-related data structure. It uses the  StockCounterClient.ehttp object to make an HTTP POST request with the delivery note and invoice-related data, and returns a success response. */
    static addDeliveryNote(invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /** deleteDeliveryNotes : This method deletes multiple delivery notes based on the provided credentials. It takes an array of  credentials  objects, where each object contains the necessary information to identify and delete a delivery note. It uses the  StockCounterClient.ehttp object to make an HTTP PUT request with the credentials data, and returns a success response. */
    static deleteDeliveryNotes(credentials: IdeleteCredentialsInvRel[]): Promise<Isuccess>;
}
