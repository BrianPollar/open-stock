import { DatabaseAuto, Isuccess } from '@open-stock/stock-universal';
import { Item } from './item.define';
/**
 * Represents an item offer.
 */
export declare class ItemOffer extends DatabaseAuto {
    /** The user ID. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The items in the offer. */
    items: Item[];
    /** The expiration date of the offer. */
    expireAt: Date;
    /** The type of the offer. */
    type: string;
    /** The header of the offer. */
    header: string;
    /** The sub-header of the offer. */
    subHeader: string;
    /** The amount of the offer. */
    ammount: number;
    /**
     * Creates a new instance of ItemOffer.
     * @param data The data to initialize the instance with.
     */
    constructor(data: any);
    /**
     * Gets all item offers.
     * @param companyId - The ID of the company
     * @param type The type of the offer.
     * @param url The URL to get the offers from.
     * @param offset The offset to start from.
     * @param limit The maximum number of items to return.
     * @returns An array of ItemOffer instances.
     */
    static getItemOffers(companyId: string, type: string, url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        offers: ItemOffer[];
    }>;
    /**
     * Gets a single item offer.
     * @param companyId - The ID of the company
     * @param id The ID of the offer to get.
     * @returns An instance of ItemOffer.
     */
    static getOneItemOffer(companyId: string, id: string): Promise<ItemOffer>;
    /**
     * Creates a new item offer.
     * @param companyId - The ID of the company
     * @param itemoffer The item offer to create.
     * @returns An instance of Isuccess.
     */
    static createItemOffer(companyId: string, itemoffer: {
        items: string[] | Item[];
        expireAt: Date;
        header: string;
        subHeader: string;
        ammount: number;
    }): Promise<Isuccess>;
    /**
     * Deletes multiple item offers.
     * @param companyId - The ID of the company
     * @param ids The IDs of the offers to delete.
     * @returns An instance of Isuccess.
     */
    static deleteItemOffers(companyId: string, ids: string[]): Promise<Isuccess>;
    /**
     * Updates an item offer.
     * @param companyId - The ID of the company
     * @param vals The values to update the item offer with.
     * @returns An instance of Isuccess.
     */
    updateItemOffer(companyId: string, vals: any): Promise<Isuccess>;
    /**
     * Deletes an item offer.
     * @param companyId - The ID of the company
     * @returns An instance of Isuccess.
     */
    deleteItemOffer(companyId: string): Promise<Isuccess>;
}
