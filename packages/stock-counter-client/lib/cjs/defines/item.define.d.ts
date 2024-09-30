import { DatabaseAuto, IcostMeta, IdeleteMany, Ifile, IfileMeta, IfilterProps, IinventoryMeta, Iitem, Isponsored, IsubscriptionFeatureState, Isuccess, TitemColor, TitemState } from '@open-stock/stock-universal';
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
    /** The category of the item. */
    category?: string;
    subCategory?: string;
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
    video?: IfileMeta;
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
    soldCount: number;
    /**
     * Represents the constructor of the Item class.
     * @param data - The data used to initialize the Item instance.
     */
    constructor(data: Iitem);
    /**
     * Searches for items.
  
     * @param type The type of the item.
     * @param searchterm The search term.
     * @param searchKey The search key.
     * @param extraFilters Additional filters.
     * @returns An array of items that match the search criteria.
     */
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        items: Item[];
    }>;
    /**
     * Gets items.
  
     * @param offset The offset to start getting items from.
     * @param limit The maximum number of items to get.
     * @returns An array of items.
     */
    static getAll(route: 'all' | 'gettodaysuggestions' | 'getbehaviourdecoy' | 'getfeatured', offset?: number, limit?: number, ecomerceCompat?: 'false' | 'true'): Promise<{
        count: number;
        items: Item[];
    }>;
    /**
     * Gets a single item.
  
     * @param url The URL to get the item from.
     * @returns The item.
     */
    static getOne(urId: string): Promise<Item>;
    /**
     * Adds an item.
  
     * @param vals The values to add the item with.
     * @param files The files to add to the item.
     * @param inventoryStock Whether the item is in inventory stock.
     * @returns The success status of adding the item.
     */
    static add(vals: Partial<Iitem>, files: Ifile[], ecomerceCompat?: boolean): Promise<IsubscriptionFeatureState>;
    /**
     * Deletes items.
  
     * @param _ids The IDs of the items to delete.
     * @param filesWithDir The files to delete with their directories.
     * @param url The URL to delete the items from.
     * @returns The success status of deleting the items.
     */
    static removeMany(url: string, vals: IdeleteMany): Promise<Isuccess>;
    /**
     * Updates an item.
  
     * @param vals The values to update the item with.
     * @param url The URL to update the item from.
     * @param files The files to update the item with.
     * @returns The success status of updating the item.
     */
    update(vals: Partial<Iitem>, files?: Ifile[]): Promise<Isuccess>;
    /**
     * Makes an item sponsored.
  
     * @param sponsored The sponsored item.
     * @param item The item to make sponsored.
     * @returns The success status of making the item sponsored.
     */
    addSponsored(sponsored: Isponsored, item: Item): Promise<Isuccess>;
    /**
     * Updates a sponsored item.
  
     * @param sponsored The sponsored item to update.
     * @returns The success status of updating the sponsored item.
     */
    updateSponsored(sponsored: Isponsored): Promise<Isuccess>;
    /**
     * Deletes a sponsored item.
  
     * @param itemId The ID of the item to delete.
     * @returns The success status of deleting the sponsored item.
     */
    removeSponsored(itemId: string): Promise<Isuccess>;
    /**
     * Retrieves sponsored items for a given company.
     .
     * @returns A Promise that resolves to an array of sponsored items.
     */
    getSponsored(): Promise<void[]>;
    /**
     * Likes an item.
     .
     * @param userId - The ID of the user.
     * @returns A promise that resolves to the updated item.
     */
    like(userId: string): Promise<Isuccess>;
    /**
     * Unlikes an item by removing the user's like from the item's likes array.
      associated with the item.
     * @param userId - The ID of the user who unliked the item.
     * @returns A promise that resolves to the updated item.
     */
    unLike(userId: string): Promise<Isuccess>;
    /**
     * Deletes an item associated with a company.
     .
     * @returns A promise that resolves to the success response.
     */
    remove(): Promise<Isuccess>;
    /**
     * Deletes images associated with an item.
     * @param filesWithDir - An array of file metadata objects.
     * @returns A promise that resolves to the success status of the deletion.
     */
    removeFiles(filesWithDir: IfileMeta[]): Promise<Isuccess>;
    /**
     * Updates the properties of the item based on the provided data.
     * @param {object} data - The data containing the properties to update.
     */
    appndPdctCtror(data: Iitem): void;
}
