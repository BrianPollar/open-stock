import { DatabaseAuto, Isuccess } from '@open-stock/stock-universal';
/** ItemLimitted  class: This class extends
 * the  DatabaseAuto  class and represents
 * an item limitted object in the database. It has
 * properties for  urId  (a string representing the UUID)
 * and  name  (an array of  Item  objects). */
export declare class ItemLimitted extends DatabaseAuto {
    /** The UUID of the item limitted. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The name of the item limitted. */
    name: string;
    /**
     * Creates an instance of ItemLimitted.
     * @param data - The data to initialize the instance with.
     */
    constructor(data: any);
    /**
     * Retrieves item limitteds from the server based
     * on the specified type, URL, offset, and limit.
     * @param companyId - The ID of the company
     * @param offset - The offset to start retrieving item limitteds from.
     * @param limit - The maximum number of item limitteds to retrieve.
     * @returns An array of ItemLimitted instances.
     */
    static getItemLimitteds(companyId: string, offset?: number, limit?: number): Promise<ItemLimitted[]>;
    /**
     * Retrieves a specific item limitted from the server
     * based on the provided ID.
     * @param companyId - The ID of the company
     * @param id - The ID of the item limitted to retrieve.
     * @returns A single ItemLimitted instance.
     */
    static getOneItemLimitted(companyId: string, id: string): Promise<ItemLimitted>;
    /**
     * Creates a new item limitted on the server.
     * @param companyId - The ID of the company
     * @param data - The data to create the item limitted with.
     * @returns A success response.
     */
    static createItemLimitted(companyId: string, data: any): Promise<Isuccess>;
    /**
     * Deletes multiple item limitteds from the server based on the provided IDs.
     * @param companyId - The ID of the company
     * @param ids - The IDs of the item limitteds to delete.
     * @returns A success response.
     */
    static deleteItemLimitteds(companyId: string, ids: string[]): Promise<Isuccess>;
    /**
     * Updates the current item limitted instance on the server.
     * @param companyId - The ID of the company
     * @param data - The data to update the item limitted with.
     * @returns A success response.
     */
    update(companyId: string, data: any): Promise<Isuccess>;
    /**
     * Deletes the current item limitted instance from the server.
     * @param companyId - The ID of the company
     * @returns A success response.
     */
    deleteItemLimitted(companyId: string): Promise<Isuccess>;
}
