import { DatabaseAuto, IdeleteMany, IfilterProps, IinvoicesReport, Isuccess } from '@open-stock/stock-universal';
import { Invoice } from '../invoice.define';
export declare class InvoiceReport extends DatabaseAuto {
    urId: string;
    companyId?: string;
    totalAmount: number;
    date: Date;
    invoices: Invoice[];
    readonly currency: string;
    constructor(data: IinvoicesReport);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        invoicesreports: InvoiceReport[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        invoicesreports: InvoiceReport[];
    }>;
    static getOne(urIdOr_id: string): Promise<InvoiceReport>;
    static add(vals: IinvoicesReport): Promise<Isuccess>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
