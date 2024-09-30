import { DatabaseAuto, IdeleteMany, Ideliverycity, Isuccess, TpriceCurrenncy } from '@open-stock/stock-universal';
export declare class DeliveryCity extends DatabaseAuto {
    name: string;
    shippingCost: number;
    currency: TpriceCurrenncy;
    deliversInDays: number;
    /**
     * Creates a new instance of DeliveryCity.
     * @param data An object containing the data to initialize the instance.
     */
    constructor(data: Ideliverycity);
    /**
     * Retrieves all delivery cities from the server.
  
     * @param url The URL to retrieve the delivery cities from.
     * @param offset The offset to start retrieving the delivery cities from.
     * @param limit The maximum number of delivery cities to retrieve.
     * @returns An array of DeliveryCity instances.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        citys: DeliveryCity[];
    }>;
    /**
     * Retrieves a single delivery city from the server.
  
     * @param _id The ID of the delivery city to retrieve.
     * @returns A DeliveryCity instance.
     */
    static getOne(_id: string): Promise<DeliveryCity>;
    /**
     * Creates a new delivery city on the server.
  
     * @param deliverycity An object containing the data for the new delivery city.
     * @returns An object indicating whether the operation was successful.
     */
    static add(deliverycity: Ideliverycity): Promise<Isuccess>;
    /**
     * Deletes multiple delivery cities from the server.
  
     * @param _ids An array of IDs of the delivery cities to delete.
     * @returns An object indicating whether the operation was successful.
     */
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    /**
     * Updates the properties of the current
     *  instance with the provided values and sends a
     *  request to the server to update the corresponding delivery city.
  
     * @param vals An object containing the new values for the delivery city.
     * @returns An object indicating whether the operation was successful.
     */
    update(vals: Ideliverycity): Promise<Isuccess>;
    /**
     * Sends a request to the server to delete the current delivery city.
  
     * @returns An object indicating whether the operation was successful.
     */
    remove(): Promise<Isuccess>;
}
