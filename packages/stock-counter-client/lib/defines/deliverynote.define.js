import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';
/** DeliveryNote  class: This class extends the  InvoiceRelated  class (which is not provided) and represents a delivery note. It has a  urId  property to store the unique identifier of the delivery note. */
export class DeliveryNote extends InvoiceRelatedWithReceipt {
    constructor(data) {
        super(data);
        this.urId = data.urId;
    }
    /** getDeliveryNotes : This method retrieves a list of delivery notes from a specified URL, with optional pagination parameters for offset and limit. It uses the  StockCounterClient.ehttp object to make an HTTP GET request and returns an array of  DeliveryNote  instances. */
    static async getDeliveryNotes(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverynote/${url}/${offset}/${limit}`);
        const deliverynotes = await lastValueFrom(observer$);
        return deliverynotes
            .map((val) => new DeliveryNote(val));
    }
    /** getOneDeliveryNote : This method retrieves a single delivery note by its unique identifier ( urId ). It uses the  StockCounterClient.ehttp object to make an HTTP GET request and returns a single  DeliveryNote  instance. */
    static async getOneDeliveryNote(urId) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/deliverynote/getone/${urId}`);
        const deliverynote = await lastValueFrom(observer$);
        return new DeliveryNote(deliverynote);
    }
    /** addDeliveryNote : This method adds a new delivery note to the system. It takes an  invoiceRelated  object as a parameter, which is an invoice-related data structure. It uses the  StockCounterClient.ehttp object to make an HTTP POST request with the delivery note and invoice-related data, and returns a success response. */
    static async addDeliveryNote(invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/deliverynote/create', { deliveryNote: {}, invoiceRelated });
        return await lastValueFrom(observer$);
    }
    /** deleteDeliveryNotes : This method deletes multiple delivery notes based on the provided credentials. It takes an array of  credentials  objects, where each object contains the necessary information to identify and delete a delivery note. It uses the  StockCounterClient.ehttp object to make an HTTP PUT request with the credentials data, and returns a success response. */
    static async deleteDeliveryNotes(credentials) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/deliverynote/deletemany', { credentials });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=deliverynote.define.js.map