import { DatabaseAuto, Isuccess } from '@open-stock/stock-universal';
/** ItemLimitted  class: This class extends
 * the  DatabaseAuto  class and represents
 * an item limitted object in the database. It has
 * properties for  urId  (a string representing the UUID)
 * and  name  (an array of  Item  objects). */
export declare class ItemLimitted extends DatabaseAuto {
    /** */
    urId: string;
    /** */
    name: string;
    /** constructor : The constructor method
     * initializes the  urId  and  name
     * properties based on the provided data. */
    constructor(data: any);
    /** getItemLimitteds  static method: This method
     * retrieves item limitteds from the server based
     * on the specified type, URL, offset, and limit.
     * It returns an array of  ItemLimitted  instances. */
    static getItemLimitteds(offset?: number, limit?: number): Promise<ItemLimitted[]>;
    /** getOneItemLimitted  static method: This method
     * retrieves a specific item limitted from the server
     * based on the provided ID. It returns a single
     * ItemLimitted  instance. */
    static getOneItemLimitted(id: string): Promise<ItemLimitted>;
    /** createItemLimitted  static method: This method
     * creates a new item limitted on the server. It accepts
     * a parameter to determine the creation
     * method ('automatic' or 'manual') and the item limitted data.
     * It returns a success response. */
    static createItemLimitted(data: any): Promise<Isuccess>;
    /** deleteItemLimitteds  static method: This method deletes multiple item limitteds from the server based on the provided IDs. It returns a success response. */
    static deleteItemLimitteds(ids: string[]): Promise<Isuccess>;
    update(data: any): Promise<Isuccess>;
    /** deleteItemLimitted  method: This method deletes the current item limitted instance from the server. It returns a success response. */
    deleteItemLimitted(): Promise<Isuccess>;
}
