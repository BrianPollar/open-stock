import { DatabaseAuto, IdeleteMany, IeditReceipt, IfilterProps, IinvoiceRelated, IinvoiceRelatedPdct, Ireceipt, Isuccess, TestimateStage, TinvoiceStatus, TinvoiceType, TreceiptType } from '@open-stock/stock-universal';
export declare class InvoiceRelated extends DatabaseAuto {
    invoiceRelated: string;
    creationType: TinvoiceType;
    estimateId: number;
    invoiceId: number;
    billingUser: string;
    extraCompanyDetails: string;
    items: IinvoiceRelatedPdct[];
    billingUserId: string;
    billingUserPhoto: string;
    stage: TestimateStage;
    status: TinvoiceStatus;
    cost: number;
    paymentMade: number;
    tax: number;
    balanceDue: number;
    subTotal: number;
    total: number;
    fromDate: Date;
    toDate: Date;
    ecommerceSale: boolean;
    ecommerceSalePercentage: number;
    readonly currency: string;
    constructor(data: Required<IinvoiceRelated>);
    static addInvoicePayment(payment: Ireceipt): Promise<Isuccess>;
    static updateInvoiceRelated(invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
}
export declare class Receipt extends InvoiceRelated {
    urId: string;
    companyId: string;
    ammountRcievd: number;
    paymentMode: string;
    type: TreceiptType;
    paymentInstall: string;
    date: Date;
    amount: number;
    constructor(data: Required<Ireceipt>);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        receipts: Receipt[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        receipts: Receipt[];
    }>;
    static getOne(urIdOr_id: string): Promise<Receipt>;
    static add(vals: IeditReceipt): Promise<Isuccess>;
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    update(vals: IeditReceipt): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
