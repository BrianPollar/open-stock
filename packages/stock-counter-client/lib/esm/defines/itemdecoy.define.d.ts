import { DatabaseAuto, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { Item } from './item.define';
/**
 * ItemDecoy class: This class extends the DatabaseAuto class and represents
 * an item decoy object in the database. It has properties for urId (a string representing the UUID)
 * and items (an array of Item objects).
 */
export declare class ItemDecoy extends DatabaseAuto {
    /** A string representing the UUID */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** An array of Item objects */
    items: Item[];
    /**
     * Constructor method initializes the urId and items properties based on the provided data.
     * @param data An object containing the data to initialize the properties.
     */
    constructor(data: {
        urId: string;
        /** The user's company ID. */
        companyId: string;
        items: Item[];
    });
    /**
     * Static method that retrieves item decoys from the server based on the specified type, URL, offset, and limit.
     * It returns an array of ItemDecoy instances.
     * @param companyId - The ID of the company
     * @param url A string representing the URL to retrieve the item decoys from.
     * @param offset A number representing the offset to start retrieving the item decoys from.
     * @param limit A number representing the maximum number of item decoys to retrieve.
     * @returns An array of ItemDecoy instances.
     */
    static getItemDecoys(companyId: string, url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        decoys: ItemDecoy[];
    }>;
    /**
     * Static method that retrieves a specific item decoy from the server based on the provided ID.
     * It returns a single ItemDecoy instance.
     * @param companyId - The ID of the company
     * @param id A string representing the ID of the item decoy to retrieve.
     * @returns A single ItemDecoy instance.
     */
    static getOneItemDecoy(companyId: string, id: string): Promise<ItemDecoy>;
    /**
     * Static method that creates a new item decoy on the server.
     * It accepts a parameter to determine the creation method ('automatic' or 'manual') and the item decoy data.
     * It returns a success response.
     * @param how A string representing the creation method ('automatic' or 'manual').
     * @param itemdecoy An object containing the item decoy data.
     * @returns A success response.
     */
    static createItemDecoy(companyId: string, how: 'automatic' | 'manual', itemdecoy: {
        itemId: string;
    } | {
        items: string[];
    }): Promise<IsubscriptionFeatureState>;
    /**
     * Static method that deletes multiple item decoys from the server based on the provided IDs.
     * It returns a success response.
     * @param companyId - The ID of the company
     * @param ids An array of strings representing the IDs of the item decoys to delete.
     * @returns A success response.
     */
    static deleteItemDecoys(companyId: string, ids: string[]): Promise<Isuccess>;
    /**
     * Method that deletes the current item decoy instance from the server.
     * It returns a success response.
     * @returns A success response.
     */
    deleteItemDecoy(companyId: string): Promise<Isuccess>;
}
