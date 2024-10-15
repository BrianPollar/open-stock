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
    amount: number;
    readonly currency: string;
    constructor(data: any);
    static getAll(type: string, // TODO union here
    offset?: number, limit?: number): Promise<{
        count: number;
        offers: ItemOffer[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        offers: ItemOffer[];
    }>;
    static getOne(urIdOr_id: string): Promise<ItemOffer>;
    static add(itemoffer: {
        items: string[] | Item[];
        expireAt: Date;
        header: string;
        subHeader: string;
        amount: number;
    }): Promise<IsubscriptionFeatureState>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    update(vals: any): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
