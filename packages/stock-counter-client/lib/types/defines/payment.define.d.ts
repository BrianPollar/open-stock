import { Iaddress, Ibilling, IcreateOrder, IdeleteMany, IfilterProps, Ipayment, IpaymentRelated, Isuccess, IupdatePay, TpaymentMethod } from '@open-stock/stock-universal';
import { InvoiceRelatedWithReceipt } from './invoice.define';
export declare class PaymentRelated extends InvoiceRelatedWithReceipt {
    paymentRelated: string;
    urId: string;
    companyId: string;
    orderDate: Date;
    paymentDate: Date;
    billingAddress: Ibilling;
    shippingAddress: Iaddress;
    readonly currency: string;
    user: any;
    isBurgain: boolean;
    shipping: number;
    manuallyAdded: boolean;
    paymentMethod: TpaymentMethod;
    orderDeliveryCode: string;
    constructor(data: Required<IpaymentRelated>);
}
export declare class Payment extends PaymentRelated {
    order: string;
    constructor(data: Required<Ipayment>);
    static add(vals: IcreateOrder): Promise<Isuccess>;
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        payments: Payment[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        payments: Payment[];
    }>;
    static getOne(id: string): Promise<Payment>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    update(vals: IupdatePay): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
