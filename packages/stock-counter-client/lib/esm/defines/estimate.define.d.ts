import { IdeleteMany, IeditEstimate, Iestimate, IfilterProps, IinvoiceRelated, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from './invoice.define';
export declare class Estimate extends InvoiceRelatedWithReceipt {
    fromDate: Date;
    toDate: Date;
    urId: string;
    constructor(data: Required<Iestimate>);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        estimates: Estimate[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        estimates: Estimate[];
    }>;
    static getOne(urIdOr_id: string): Promise<Estimate>;
    static add(vals: IeditEstimate): Promise<IsubscriptionFeatureState>;
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    updatePdt(vals: IinvoiceRelated): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
