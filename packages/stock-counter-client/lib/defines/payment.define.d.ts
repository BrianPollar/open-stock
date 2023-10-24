import { InvoiceRelatedWithReceipt } from './invoice.define';
import { Iaddress, IbagainCredential, Ibilling, IdeleteCredentialsPayRel, IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Isuccess, TpaymentMethod } from '@open-stock/stock-universal';
/** */
export declare class PaymentRelated extends InvoiceRelatedWithReceipt {
    paymentRelated: string;
    urId: string;
    orderDate: Date;
    paymentDate: Date;
    billingAddress: Ibilling;
    shippingAddress: Iaddress;
    currency: string;
    user: any;
    isBurgain: boolean;
    shipping: number;
    manuallyAdded: boolean;
    paymentMethod: TpaymentMethod;
    constructor(data: Required<IpaymentRelated>);
}
/** */
export declare class Payment extends PaymentRelated {
    /** */
    order: string;
    /** */ constructor(data: Required<Ipayment>);
    /** */
    static getBrainTreeToken(): Promise<string | null>;
    /** */
    static createPayment(paymentRelated: IpaymentRelated, invoiceRelated: IinvoiceRelated, order: Iorder, payment: Ipayment, bagainCred: IbagainCredential, nonce?: any): Promise<Isuccess>;
    /** */
    static searchPayments(searchterm: string, searchKey: string): Promise<Payment[]>;
    /** */
    static getPayments(url?: string, offset?: number, limit?: number): Promise<Payment[]>;
    /** */
    static getOnePayment(id: string): Promise<Payment>;
    /** */
    static deletePayments(credentials: IdeleteCredentialsPayRel[]): Promise<Isuccess>;
    /** */
    updatePayment(updatedPayment: Ipayment, paymentRelated: IpaymentRelated, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /** */
    deletePayment(): Promise<Isuccess>;
}
