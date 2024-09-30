import { DatabaseAuto, IdeleteMany, IfilterProps, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { Item } from './item.define';
export declare class ItemOffer extends DatabaseAuto {
    urId: string;
    companyId: string;
    items: Item[];
    expireAt: Date;
    type: string;
    header: string;
    subHeader: string;
    ammount: number;
    readonly currency: string;
    /**
     * Creates a new instance of ItemOffer.
     * @param data The data to initialize the instance with.
     */
    constructor(data: any);
    /**
     * Gets all item offers.
  
     * @param type The type of the offer.
     * @param url The URL to get the offers from.
     * @param offset The offset to start from.
     * @param limit The maximum number of items to return.
     * @returns An array of ItemOffer instances.
     */
    static getAll(type: string, // TODO union here
    offset?: number, limit?: number): Promise<{
        count: number;
        offers: ItemOffer[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        offers: ItemOffer[];
    }>;
    /**
     * Gets a single item offer.
  
     * @param _id The ID of the offer to get.
     * @returns An instance of ItemOffer.
     */
    static getOne(_id: string): Promise<ItemOffer>;
    /**
     * Creates a new item offer.
  
     * @param itemoffer The item offer to create.
     * @returns An instance of Isuccess.
     */
    static add(itemoffer: {
        items: string[] | Item[];
        expireAt: Date;
        header: string;
        subHeader: string;
        ammount: number;
    }): Promise<IsubscriptionFeatureState>;
    /**
     * Deletes multiple item offers.
  
     * @param _ids The IDs of the offers to delete.
     * @returns An instance of Isuccess.
     */
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    /**
     * Updates an item offer.
  
     * @param vals The values to update the item offer with.
     * @returns An instance of Isuccess.
     */
    update(vals: any): Promise<Isuccess>;
    /**
     * Deletes an item offer.
  
     * @returns An instance of Isuccess.
     */
    remove(): Promise<Isuccess>;
}
