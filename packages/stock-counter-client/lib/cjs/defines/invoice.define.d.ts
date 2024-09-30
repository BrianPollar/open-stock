import { IdeleteMany, IeditInvoice, IfilterProps, Iinvoice, IinvoiceRelated, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelated, Receipt } from './receipt.define';
export declare class InvoiceRelatedWithReceipt extends InvoiceRelated {
    payments: Receipt[];
    constructor(data: Required<IinvoiceRelated>);
    static getInvoiceRelateds(offset?: number, limit?: number): Promise<{
        count: number;
        invoiceRelateds: InvoiceRelatedWithReceipt[];
    }>;
    static filterInvoiceRelateds(filter: IfilterProps): Promise<{
        count: number;
        invoiceRelateds: InvoiceRelatedWithReceipt[];
    }>;
    static getOneInvoiceRelated(_id: string): Promise<InvoiceRelatedWithReceipt>;
}
export declare class Invoice extends InvoiceRelatedWithReceipt {
    dueDate: Date;
    urId: string;
    constructor(data: Required<Iinvoice>);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        invoices: Invoice[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        invoices: Invoice[];
    }>;
    static getOne(urId: string): Promise<Invoice>;
    static add(vals: IeditInvoice): Promise<IsubscriptionFeatureState>;
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    update(vals: IeditInvoice): Promise<Isuccess>;
}
