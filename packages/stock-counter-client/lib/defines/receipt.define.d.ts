import { DatabaseAuto, IdeleteCredentialsInvRel, Iinvoice, IinvoiceRelated, IinvoiceRelatedPdct, Ireceipt, Isuccess, TestimateStage, TinvoiceStatus, TinvoiceType, TreceiptType } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from './invoice.define';
/** The  InvoiceRelated  class is a subclass of the  DatabaseAuto  class and represents an invoice-related object. It has properties such as invoice related ID, creation type, estimate ID, invoice ID, billing user, items (an array of invoice-related product objects), billing user ID, billing user photo, stage, status, cost, payment made, tax, balance due, sub total, total, from date, to date, and payments (an array of payment install objects). The class also has methods for retrieving invoice-related objects from the server, adding and deleting invoice payments, and updating invoice payments. */
export declare class InvoiceRelated extends DatabaseAuto {
    /** */
    invoiceRelated: string;
    /** */
    creationType: TinvoiceType;
    /** */
    estimateId: number;
    /** */
    invoiceId: number;
    /** */
    billingUser: string;
    /** */
    extraCompanyDetails: string;
    /** */
    items: IinvoiceRelatedPdct[];
    /** */
    billingUserId: string;
    /** */
    billingUserPhoto: string;
    /** */
    stage: TestimateStage;
    /** */
    status: TinvoiceStatus;
    /** */
    cost: number;
    /** */
    paymentMade: number;
    /** */
    tax: number;
    /** */
    balanceDue: number;
    /** */
    subTotal: number;
    /** */
    total: number;
    /** */
    fromDate: Date;
    /** */
    toDate: Date;
    /** */
    constructor(data: Required<IinvoiceRelated>);
    /** */
    static getInvoiceRelateds(url?: string, offset?: number, limit?: number): Promise<InvoiceRelatedWithReceipt[]>;
    /** */
    static searchInvoiceRelateds(searchterm: string, searchKey: string, offset?: number, limit?: number): Promise<InvoiceRelatedWithReceipt[]>;
    /** */
    static getOneInvoiceRelated(id: string): Promise<InvoiceRelatedWithReceipt>;
    /** */
    static getInvoicePayments(): Promise<Receipt[]>;
    /** */
    static getOneInvoicePayment(urId: string): Promise<Receipt>;
    /** */
    static addInvoicePayment(payment: Ireceipt): Promise<Isuccess>;
    /** */
    static deleteInvoicePayments(ids: string[]): Promise<Isuccess>;
    /** */
    static updateInvoicePayment(updatedInvoice: Iinvoice, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /** */
    static updateInvoiceRelated(invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
}
/** */
export declare class Receipt extends InvoiceRelated {
    /** */
    urId: string;
    /** */
    ammountRcievd: number;
    /** */
    paymentMode: string;
    /** */
    type: TreceiptType;
    /** */
    paymentInstall: string;
    date: Date;
    amount: number;
    /** */
    constructor(data: Required<Ireceipt>);
    /** */
    static getReceipts(url?: string, offset?: number, limit?: number): Promise<Receipt[]>;
    /** */
    static getOneReceipt(urId: string): Promise<Receipt>;
    /** */
    static addReceipt(receipt: Ireceipt, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /** */
    static deleteReceipts(credentials: IdeleteCredentialsInvRel[]): Promise<Isuccess>;
    /** */
    updateReciept(updatedReceipt: Ireceipt, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
}
