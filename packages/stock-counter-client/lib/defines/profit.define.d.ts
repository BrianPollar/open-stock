import { DatabaseAuto, Iprofit, Isuccess } from '@open-stock/stock-universal';
/** */
export declare class Profit extends DatabaseAuto {
    /** */
    margin: number;
    /** */
    origCost: number;
    /** */
    soldAtPrice: number;
    /** */
    constructor(data: Iprofit);
    /** */
    static getProfits(url?: string, offset?: number, limit?: number): Promise<Profit[]>;
    /** */
    static getOneProfit(id: string): Promise<Profit>;
    /** */
    static addProfit(vals: Iprofit): Promise<Isuccess>;
    /** */
    static deleteProfits(ids: string[], filesWithDir: any, url: string): Promise<Isuccess>;
    /** */
    updateProfit(vals: Iprofit): Promise<Isuccess>;
}
