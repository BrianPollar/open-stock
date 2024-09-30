import { DatabaseAuto, IdeleteMany, IfilterProps, Isuccess, ItaxReport } from '@open-stock/stock-universal';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
export declare class TaxReport extends DatabaseAuto {
    urId: string;
    companyId: string;
    totalAmount: number;
    date: Date;
    estimates: Estimate[];
    invoiceRelateds: InvoiceRelatedWithReceipt[];
    readonly currency: string;
    constructor(data: ItaxReport);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        taxreports: TaxReport[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        taxreports: TaxReport[];
    }>;
    static getOne(urId: string): Promise<TaxReport>;
    static add(vals: ItaxReport): Promise<Isuccess>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
