import { Item } from './item.define';
import { DatabaseAuto, Isuccess } from '@open-stock/stock-universal';
/** ItemDecoy  class: This class extends
 * the  DatabaseAuto  class and represents
 * an item decoy object in the database. It has
 * properties for  urId  (a string representing the UUID)
 * and  items  (an array of  Item  objects). */
export declare class ItemDecoy extends DatabaseAuto {
    /** */
    urId: string;
    /** */
    items: Item[];
    /** constructor : The constructor method
     * initializes the  urId  and  items
     * properties based on the provided data. */
    constructor(data: any);
    /** getItemDecoys  static method: This method
     * retrieves item decoys from the server based
     * on the specified type, URL, offset, and limit.
     * It returns an array of  ItemDecoy  instances. */
    static getItemDecoys(url?: string, offset?: number, limit?: number): Promise<ItemDecoy[]>;
    /** getOneItemDecoy  static method: This method
     * retrieves a specific item decoy from the server
     * based on the provided ID. It returns a single
     * ItemDecoy  instance. */
    static getOneItemDecoy(id: string): Promise<ItemDecoy>;
    /** createItemDecoy  static method: This method
     * creates a new item decoy on the server. It accepts
     * a parameter to determine the creation
     * method ('automatic' or 'manual') and the item decoy data.
     * It returns a success response. */
    static createItemDecoy(how: 'automatic' | 'manual', itemdecoy: {
        itemId: string;
    } | {
        items: string[];
    }): Promise<Isuccess>;
    /** deleteItemDecoys  static method: This method deletes multiple item decoys from the server based on the provided IDs. It returns a success response. */
    static deleteItemDecoys(ids: string[]): Promise<Isuccess>;
    /** deleteItemDecoy  method: This method deletes the current item decoy instance from the server. It returns a success response. */
    deleteItemDecoy(): Promise<Isuccess>;
}
