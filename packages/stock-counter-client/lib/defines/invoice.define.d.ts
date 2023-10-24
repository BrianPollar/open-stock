import { IdeleteCredentialsInvRel, Iinvoice, IinvoiceRelated, Isuccess } from '@open-stock/stock-universal';
import { InvoiceRelated, Receipt } from './receipt.define';
export declare class InvoiceRelatedWithReceipt extends InvoiceRelated {
    /** */
    payments: Receipt[];
    constructor(data: Required<IinvoiceRelated>);
}
/** */
export declare class Invoice extends InvoiceRelatedWithReceipt {
    /** */
    dueDate: Date;
    /** */
    constructor(data: Required<Iinvoice>);
    /** */
    static getInvoices(url?: string, offset?: number, limit?: number): Promise<Invoice[]>;
    /** */
    static getOneInvoice(invoiceId: number): Promise<Invoice>;
    /** */
    static addInvoice(invoice: Iinvoice, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /** */
    static deleteInvoices(credentials: IdeleteCredentialsInvRel[]): Promise<Isuccess>;
    /** */
    update(updatedInvoice: Iinvoice, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
}
