import { DatabaseAuto, IdeleteMany, IfilterProps, Iitem, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { Item } from './item.define';
export declare class ItemDecoy extends DatabaseAuto {
    urId: string;
    companyId: string;
    items: Item[];
    constructor(data: {
        urId: string;
        companyId: string;
        items: Iitem[];
    });
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        decoys: ItemDecoy[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        decoys: ItemDecoy[];
    }>;
    static getOne(urIdOr_id: string): Promise<ItemDecoy>;
    static add(how: 'automatic' | 'manual', itemdecoy: {
        itemId: string;
    } | {
        items: string[];
    }): Promise<IsubscriptionFeatureState>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
