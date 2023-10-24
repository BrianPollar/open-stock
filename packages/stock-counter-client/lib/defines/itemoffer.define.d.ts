import { Item } from './item.define';
import { DatabaseAuto, Isuccess } from '@open-stock/stock-universal';
/** */
export declare class ItemOffer extends DatabaseAuto {
    /** */
    urId: string;
    /** */
    items: Item[];
    /** */
    expireAt: Date;
    /** */
    type: string;
    /** */
    header: string;
    /** */
    subHeader: string;
    /** */
    ammount: number;
    /** */
    constructor(data: any);
    /** */
    static getItemOffers(type: string, url?: string, offset?: number, limit?: number): Promise<ItemOffer[]>;
    /** */
    static getOneItemOffer(id: string): Promise<ItemOffer>;
    /** */
    static createItemOffer(itemoffer: {
        items: string[] | Item[];
        expireAt: Date;
        header: string;
        subHeader: string;
        ammount: number;
    }): Promise<Isuccess>;
    /** */
    static deleteItemOffers(ids: string[]): Promise<Isuccess>;
    /** */
    updateItemOffer(vals: any): Promise<Isuccess>;
    /** */
    deleteItemOffer(): Promise<Isuccess>;
}
