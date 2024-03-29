import { DatabaseAuto, Ideliverycity, Isuccess, TpriceCurrenncy } from '@open-stock/stock-universal';
/** The  DeliveryCity  class extends the  DatabaseAuto  class and has properties for name, shipping cost, currency, and delivery time. The constructor initializes these properties using the data provided. The class also provides static methods for retrieving delivery cities from the server, creating a new delivery city, deleting multiple delivery cities, updating a delivery city, and deleting a single delivery city. */
/**
 * Represents a delivery city with its properties.
 */
export declare class DeliveryCity extends DatabaseAuto {
    /**
     * The name of the delivery city.
     */
    name: string;
    /**
     * The shipping cost of the delivery city.
     */
    shippingCost: number;
    /**
     * The currency used for the shipping cost.
     */
    currency: TpriceCurrenncy;
    /**
     * The number of days it takes to make the delivery.
     */
    deliversInDays: number;
    /**
     * Creates a new instance of DeliveryCity.
     * @param data An object containing the data to initialize the instance.
     */
    constructor(data: Ideliverycity);
    /**
     * Retrieves all delivery cities from the server.
     * @param companyId - The ID of the company
     * @param url The URL to retrieve the delivery cities from.
     * @param offset The offset to start retrieving the delivery cities from.
     * @param limit The maximum number of delivery cities to retrieve.
     * @returns An array of DeliveryCity instances.
     */
    static getDeliveryCitys(companyId: string, url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        citys: DeliveryCity[];
    }>;
    /**
     * Retrieves a single delivery city from the server.
     * @param companyId - The ID of the company
     * @param id The ID of the delivery city to retrieve.
     * @returns A DeliveryCity instance.
     */
    static getOneDeliveryCity(companyId: string, id: string): Promise<DeliveryCity>;
    /**
     * Creates a new delivery city on the server.
     * @param companyId - The ID of the company
     * @param deliverycity An object containing the data for the new delivery city.
     * @returns An object indicating whether the operation was successful.
     */
    static createDeliveryCity(companyId: string, deliverycity: Ideliverycity): Promise<Isuccess>;
    /**
     * Deletes multiple delivery cities from the server.
     * @param companyId - The ID of the company
     * @param ids An array of IDs of the delivery cities to delete.
     * @returns An object indicating whether the operation was successful.
     */
    static deleteDeliveryCitys(companyId: string, ids: string[]): Promise<Isuccess>;
    /**
     * Updates the properties of the current instance with the provided values and sends a request to the server to update the corresponding delivery city.
     * @param companyId - The ID of the company
     * @param vals An object containing the new values for the delivery city.
     * @returns An object indicating whether the operation was successful.
     */
    updateDeliveryCity(companyId: string, vals: Ideliverycity): Promise<Isuccess>;
    /**
     * Sends a request to the server to delete the current delivery city.
     * @param companyId - The ID of the company
     * @returns An object indicating whether the operation was successful.
     */
    deleteDeliveryCity(companyId: string): Promise<Isuccess>;
}
