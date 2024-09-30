import { DatabaseAuto, IdeleteMany, IfilterProps, IsalesReport, Isuccess } from '@open-stock/stock-universal';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';
export declare class SalesReport extends DatabaseAuto {
    urId: string;
    companyId: string;
    totalAmount: number;
    date: Date;
    estimates: Estimate[];
    invoiceRelateds: InvoiceRelatedWithReceipt[];
    readonly currency: string;
    constructor(data: IsalesReport);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        salesreports: SalesReport[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        salesreports: SalesReport[];
    }>;
    static getOne(urId: string): Promise<SalesReport>;
    static add(vals: IsalesReport): Promise<Isuccess>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
