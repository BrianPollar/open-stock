import { DatabaseAuto, IcostMeta, Ifile, IinventoryMeta, Isponsored, Isuccess, TitemColor, TitemState } from '@open-stock/stock-universal';
/** Item  class: This class represents an item object with properties and methods for manipulating item data. It includes methods for searching items, getting items, adding items, updating items, deleting items, adding and updating sponsored items, liking and unliking items, deleting images, and others. */
export declare class Item extends DatabaseAuto {
    /** */
    urId: string;
    /** */
    numbersInstock: number;
    /** */
    name: string;
    /** */
    brand: string;
    /** */
    type: string;
    /** */
    category: string;
    /** */
    state: TitemState;
    /** */
    colors: TitemColor[];
    /** */
    model: string;
    /** */
    origin: string;
    /** */
    costMeta: IcostMeta;
    /** */
    description: string;
    /** */
    inventoryMeta: IinventoryMeta[];
    /** */
    photos: string[];
    /** */
    anyKnownProblems: string;
    /** */
    numberBought: number;
    /** */
    sponsored: Isponsored[];
    /** */
    buyerGuarantee: string;
    /** */
    reviewedBy: string[];
    /** */
    reviewCount: number;
    /** */
    reviewWeight: number;
    /** */
    likes: string[];
    /** */
    likesCount: number;
    /** */
    timesViewed: number;
    /** */
    orderedQty: number;
    /** */
    reviewRatingsTotal: any;
    /** */
    constructor(data: any);
    /** */
    static searchItems(type: string, searchterm: string, searchKey: string, extraFilters: any): Promise<Item[]>;
    /** */
    static getItems(url: string, offset?: number, limit?: number): Promise<Item[]>;
    /** */
    static getOneItem(url: string): Promise<Item>;
    /** */
    static addItem(vals: object, files: Ifile[], inventoryStock?: boolean): Promise<Isuccess>;
    /** */
    static deleteItems(ids: string[], filesWithDir: any, url: string): Promise<Isuccess>;
    /** */
    updateItem(vals: object, url: string, files?: Ifile[]): Promise<Isuccess>;
    /** */
    makeSponsored(sponsored: Isponsored, item: Item): Promise<Isuccess>;
    /** */
    updateSponsored(sponsored: Isponsored): Promise<Isuccess>;
    /** */
    deleteSponsored(itemId: string): Promise<Isuccess>;
    /** */
    getSponsored(): Promise<void[]>;
    /** */
    likeItem(userId: string): Promise<Isuccess>;
    /** */
    unLikeItem(userId: string): Promise<Isuccess>;
    /** */
    deleteItem(): Promise<Isuccess>;
    /** */
    deleteImages(filesWithDir: any): Promise<Isuccess>;
    /** */
    appndPdctCtror(data: any): void;
}
