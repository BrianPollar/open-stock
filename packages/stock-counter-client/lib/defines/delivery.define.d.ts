import { DatabaseAuto, Ideliverycity, Isuccess, TpriceCurrenncy } from '@open-stock/stock-universal';
/** The  DeliveryCity  class extends the  DatabaseAuto  class and has properties for name, shipping cost, currency, and delivery time. The constructor initializes these properties using the data provided. The class also provides static methods for retrieving delivery cities from the server, creating a new delivery city, deleting multiple delivery cities, updating a delivery city, and deleting a single delivery city. */
export declare class DeliveryCity extends DatabaseAuto {
    /** */
    name: string;
    /** */
    shippingCost: number;
    /** */
    currency: TpriceCurrenncy;
    /** */
    deliversInDays: number;
    /** */
    constructor(data: Ideliverycity);
    /** */
    static getDeliveryCitys(url?: string, offset?: number, limit?: number): Promise<DeliveryCity[]>;
    /** */
    static getOneDeliveryCity(id: string): Promise<DeliveryCity>;
    /** */
    static createDeliveryCity(deliverycity: Ideliverycity): Promise<Isuccess>;
    /** */
    static deleteDeliveryCitys(ids: string[]): Promise<Isuccess>;
    /** The  updateDeliveryCity  method updates the properties of the current instance with the provided values and sends a request to the server to update the corresponding delivery city. */
    updateDeliveryCity(vals: Ideliverycity): Promise<Isuccess>;
    /** The  deleteDeliveryCity  method sends a request to the server to delete the current delivery city. */
    deleteDeliveryCity(): Promise<Isuccess>;
}
