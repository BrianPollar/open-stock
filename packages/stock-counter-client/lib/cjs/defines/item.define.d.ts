import { DatabaseAuto, IcostMeta, Ifile, IfileMeta, IinventoryMeta, Isponsored, Isuccess, TitemColor, TitemState } from '@open-stock/stock-universal';
/**
 * Item class: This class represents an item object with properties and methods for manipulating item data.
 * It includes methods for searching items, getting items, adding items, updating items, deleting items,
 * adding and updating sponsored items, liking and unliking items, deleting images, and others.
 */
export declare class Item extends DatabaseAuto {
    /** Unique identifier for the user who created the item. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The number of items in stock. */
    numbersInstock: number;
    /** The name of the item. */
    name: string;
    /** The brand of the item. */
    brand: string;
    /** The type of the item. */
    type?: string;
    /** The category of the item. */
    category?: string;
    /** The state of the item. */
    state?: TitemState;
    /** The colors of the item. */
    colors?: TitemColor[];
    /** The model of the item. */
    model?: string;
    /** The country of origin of the item. */
    origin?: string;
    /** The cost metadata of the item. */
    costMeta: IcostMeta;
    /** The description of the item. */
    description?: string;
    /** The inventory metadata of the item. */
    inventoryMeta: IinventoryMeta[];
    /** The photos of the item. */
    photos?: IfileMeta[];
    /** Any known problems with the item. */
    anyKnownProblems?: string;
    /** The number of items bought. */
    numberBought?: number;
    /** The sponsored items of the item. */
    sponsored?: Isponsored[];
    /** The buyer guarantee of the item. */
    buyerGuarantee?: string;
    /** The users who reviewed the item. */
    reviewedBy?: string[];
    /** The number of reviews of the item. */
    reviewCount?: number;
    /** The weight of the reviews of the item. */
    reviewWeight?: number;
    /** The users who liked the item. */
    likes?: string[];
    /** The number of likes of the item. */
    likesCount?: number;
    /** The number of times the item has been viewed. */
    timesViewed?: number;
    /** The quantity of the item ordered. */
    orderedQty: number;
    /** The total rating of the item. */
    reviewRatingsTotal?: any;
    /**
     * Creates an instance of Item.
     * @param data The data to initialize the item with.
     */
    ecomerceCompat: boolean;
    /**
     * Represents the constructor of the Item class.
     * @param {any} data - The data used to initialize the Item instance.
     */
    constructor(data: any);
    /**
     * Searches for items.
     * @param companyId - The ID of the company
     * @param type The type of the item.
     * @param searchterm The search term.
     * @param searchKey The search key.
     * @param extraFilters Additional filters.
     * @returns An array of items that match the search criteria.
     */
    static searchItems(companyId: string, type: string, searchterm: string, searchKey: string, extraFilters: any): Promise<Item[]>;
    /**
     * Gets items.
     * @param companyId - The ID of the company
     * @param url The URL to get the items from.
     * @param offset The offset to start getting items from.
     * @param limit The maximum number of items to get.
     * @returns An array of items.
     */
    static getItems(companyId: string, url: string, offset?: number, limit?: number): Promise<Item[]>;
    /**
     * Gets a single item.
     * @param companyId - The ID of the company
     * @param url The URL to get the item from.
     * @returns The item.
     */
    static getOneItem(companyId: string, url: string): Promise<Item>;
    /**
     * Adds an item.
     * @param companyId - The ID of the company
     * @param vals The values to add the item with.
     * @param files The files to add to the item.
     * @param inventoryStock Whether the item is in inventory stock.
     * @returns The success status of adding the item.
     */
    static addItem(companyId: string, vals: object, files: Ifile[], inventoryStock?: boolean): Promise<Isuccess>;
    /**
     * Deletes items.
     * @param companyId - The ID of the company
     * @param ids The IDs of the items to delete.
     * @param filesWithDir The files to delete with their directories.
     * @param url The URL to delete the items from.
     * @returns The success status of deleting the items.
     */
    static deleteItems(companyId: string, ids: string[], filesWithDir: any, url: string): Promise<Isuccess>;
    /**
     * Updates an item.
     * @param companyId - The ID of the company
     * @param vals The values to update the item with.
     * @param url The URL to update the item from.
     * @param files The files to update the item with.
     * @returns The success status of updating the item.
     */
    updateItem(companyId: string, vals: object, url: string, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Makes an item sponsored.
     * @param companyId - The ID of the company
     * @param sponsored The sponsored item.
     * @param item The item to make sponsored.
     * @returns The success status of making the item sponsored.
     */
    makeSponsored(companyId: string, sponsored: Isponsored, item: Item): Promise<Isuccess>;
    /**
     * Updates a sponsored item.
     * @param companyId - The ID of the company
     * @param sponsored The sponsored item to update.
     * @returns The success status of updating the sponsored item.
     */
    updateSponsored(companyId: string, sponsored: Isponsored): Promise<Isuccess>;
    /**
     * Deletes a sponsored item.
     * @param companyId - The ID of the company
     * @param itemId The ID of the item to delete.
     * @returns The success status of deleting the sponsored item.
     */
    deleteSponsored(companyId: string, itemId: string): Promise<Isuccess>;
    /**
     * Retrieves sponsored items for a given company.
     * @param companyId - The ID of the company.
     * @returns A Promise that resolves to an array of sponsored items.
     */
    getSponsored(companyId: string): Promise<void[]>;
    /**
     * Likes an item.
     * @param companyId - The ID of the company.
     * @param userId - The ID of the user.
     * @returns A promise that resolves to the updated item.
     */
    likeItem(companyId: string, userId: string): Promise<Isuccess>;
    /**
     * Unlikes an item by removing the user's like from the item's likes array.
     * @param companyId - The ID of the company associated with the item.
     * @param userId - The ID of the user who unliked the item.
     * @returns A promise that resolves to the updated item.
     */
    unLikeItem(companyId: string, userId: string): Promise<Isuccess>;
    /**
     * Deletes an item associated with a company.
     * @param companyId - The ID of the company.
     * @returns A promise that resolves to the success response.
     */
    deleteItem(companyId: string): Promise<Isuccess>;
    /**
     * Deletes images associated with an item.
     * @param companyId - The ID of the company.
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion.
     */
    deleteImages(companyId: string, filesWithDir: IfileMeta[]): Promise<Isuccess>;
    /**
     * Updates the properties of the item based on the provided data.
     * @param {object} data - The data containing the properties to update.
     */
    appndPdctCtror(data: any): void;
}
