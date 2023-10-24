import { IinvoiceRelated, Ireceipt, Isuccess, Iuser, TestimateStage, TinvoiceType } from '@open-stock/stock-universal';
import { EmailHandler } from '@open-stock/stock-notif-server';
/** */
export declare const updateInvoiceRelatedPayments: (payment: Ireceipt) => Promise<Isuccess & {
    id?: string;
}>;
/** */
export declare const updateInvoiceRelated: (invoiceRelated: Required<IinvoiceRelated>) => Promise<Isuccess & {
    id?: string;
}>;
/** */
export declare const relegateInvRelatedCreation: (invoiceRelated: Required<IinvoiceRelated>, extraNotifDesc: string, notifRedirectUrl: string, localMailHandler: EmailHandler, bypassNotif?: boolean) => Promise<Isuccess & {
    id?: string;
}>;
/** */
export declare const makeInvoiceRelatedPdct: (invoiceRelated: Required<IinvoiceRelated>, user: Iuser, createdAt?: Date, extras?: {}) => {
    invoiceRelated: string;
    creationType: TinvoiceType;
    invoiceId: number;
    estimateId: number;
    billingUser: string;
    extraCompanyDetails: string;
    items: (import("@open-stock/stock-universal").IinvoiceRelatedPdct | {
        amount: number;
        quantity: number;
        rate: number;
        itemName: any;
        item: any;
    })[];
    billingUserId: string;
    stage: TestimateStage;
    fromDate: Date;
    toDate: Date;
    status: import("@open-stock/stock-universal").TinvoiceStatus;
    cost: number;
    tax: number;
    balanceDue: number;
    subTotal: number;
    total: number;
    billingUserPhoto: string;
    createdAt: Date;
    payments: string[] | Ireceipt[];
};
/** */
export declare const deleteManyInvoiceRelated: (ids: string[]) => Promise<{
    success: boolean;
    statu: number;
    err: string;
    status?: undefined;
} | {
    success: boolean;
    status: number;
    statu?: undefined;
    err?: undefined;
} | {
    success: boolean;
    status: number;
    err: string;
    statu?: undefined;
}>;
/** */
export declare const deleteAllLinked: (invoiceRelated: string, creationType: TinvoiceType, stage: TestimateStage, from: TestimateStage) => Promise<void>;