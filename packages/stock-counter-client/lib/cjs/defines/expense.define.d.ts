import { DatabaseAuto, IdeleteMany, Iexpense, IfilterProps, IsubscriptionFeatureState, Isuccess, TexpenseCategory } from '@open-stock/stock-universal';
import { Item } from './item.define';
export declare class Expense extends DatabaseAuto {
    urId: string;
    companyId?: string;
    name: string;
    person: string;
    cost: number;
    category: TexpenseCategory;
    note: string;
    items: Item[];
    readonly currency: string;
    constructor(data: Iexpense);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        expenses: Expense[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        expenses: Expense[];
    }>;
    static getOne(urIdOr_id: string): Promise<Expense>;
    static add(vals: Iexpense): Promise<IsubscriptionFeatureState>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    update(vals: Iexpense): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
