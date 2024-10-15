import { DatabaseAuto, IcostMeta, IdeleteMany, Ifile, IfileMeta, IfilterProps, IinventoryMeta, Iitem, Isponsored, IsubscriptionFeatureState, Isuccess, TitemColor, TitemState } from '@open-stock/stock-universal';
export declare class Item extends DatabaseAuto {
    urId: string;
    companyId: string;
    numbersInstock: number;
    name: string;
    brand: string;
    category?: string;
    subCategory?: string;
    state?: TitemState;
    colors?: TitemColor[];
    model?: string;
    origin?: string;
    costMeta: IcostMeta;
    description?: string;
    inventoryMeta: IinventoryMeta[];
    photos: IfileMeta[];
    video?: IfileMeta;
    anyKnownProblems?: string;
    numberBought?: number;
    sponsored?: Isponsored[];
    buyerGuarantee?: string;
    reviewedBy?: string[];
    reviewCount: number;
    reviewWeight: number;
    likes?: string[];
    likesCount: number;
    timesViewed: number;
    orderedQty: number;
    reviewRatingsTotal: number;
    ecomerceCompat: boolean;
    soldCount: number;
    constructor(data: Iitem);
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        items: Item[];
    }>;
    static getAll(route: 'all' | 'gettodaysuggestions' | 'getbehaviourdecoy' | 'getfeatured', offset?: number, limit?: number, ecomerceCompat?: 'false' | 'true'): Promise<{
        count: number;
        items: Item[];
    }>;
    static getOne(urIdOr_id: string): Promise<Item>;
    static add(vals: Partial<Iitem>, files: Ifile[], ecomerceCompat?: boolean): Promise<IsubscriptionFeatureState>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    update(vals: Partial<Iitem>, files?: Ifile[]): Promise<Isuccess>;
    addSponsored(sponsored: Isponsored, item: Item): Promise<Isuccess>;
    updateSponsored(sponsored: Isponsored): Promise<Isuccess>;
    removeSponsored(itemId: string): Promise<Isuccess>;
    getSponsored(): Promise<(Isponsored | undefined)[]>;
    like(userId: string): Promise<Isuccess>;
    unLike(userId: string): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
    removeFiles(filesWithDir: IfileMeta[]): Promise<Isuccess>;
    /**
     * Updates the properties of the item based on the provided data.
     * @param {object} data - The data containing the properties to update.
     */
    appndPdctCtror(data: Iitem): void;
}
