import { DatabaseAuto, IdeleteMany, Ideliverycity, Isuccess, TpriceCurrenncy } from '@open-stock/stock-universal';
export declare class DeliveryCity extends DatabaseAuto {
    name: string;
    shippingCost: number;
    currency: TpriceCurrenncy;
    deliversInDays: number;
    constructor(data: Ideliverycity);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        citys: DeliveryCity[];
    }>;
    static getOne(_id: string): Promise<DeliveryCity>;
    static add(deliverycity: Ideliverycity): Promise<Isuccess>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    update(vals: Ideliverycity): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
