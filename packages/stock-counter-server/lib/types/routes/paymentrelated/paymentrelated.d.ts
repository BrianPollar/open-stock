import { IinvoiceRelated, IpaymentRelated, Ireceipt, Isuccess, Iuser, TpaymentRelatedType } from '@open-stock/stock-universal';
/** */
export declare const updatePaymentRelated: (paymentRelated: Required<IpaymentRelated>) => Promise<Isuccess & {
    id?: string;
}>;
/** */
export declare const relegatePaymentRelatedCreation: (paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, type: 'payment' | 'order', extraNotifDesc: string, notifRedirectUrl: string) => Promise<Isuccess & {
    id?: string;
}>;
/** */
export declare const makePaymentRelatedPdct: (paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, user: Iuser, meta: any) => {
    invoiceRelated: string;
    creationType: import("@open-stock/stock-universal").TinvoiceType;
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
    stage: import("@open-stock/stock-universal").TestimateStage;
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
    _id: any;
    updatedAt: any;
    paymentRelated: string;
    urId: string;
    orderDate: Date;
    paymentDate: Date;
    billingAddress: import("@open-stock/stock-universal").Ibilling;
    shippingAddress: import("@open-stock/stock-universal").Iaddress;
    currency: string;
    isBurgain: boolean;
    shipping: number;
    manuallyAdded: boolean;
    paymentMethod: import("@open-stock/stock-universal").TpaymentMethod;
};
/** */
export declare const deleteManyPaymentRelated: (ids: string[]) => Promise<Isuccess>;
/** */
export declare const deleteAllPayOrderLinked: (paymentRelated: string, invoiceRelated: string, creationType: TpaymentRelatedType, where: 'payment' | 'order') => Promise<void>;
/** */
export declare const makePaymentInstall: (receipt: Ireceipt, relatedId: string) => Promise<Isuccess>;
