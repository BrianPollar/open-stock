import { PaymentRelated } from './payment.define';
import { IbagainCredential, IdeleteCredentialsPayRel, IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Isuccess, TorderStatus } from '@open-stock/stock-universal';
/** */
export declare class Order extends PaymentRelated {
    /** */
    price: number;
    /** */
    deliveryDate: Date;
    /** */
    constructor(data: Required<Iorder>);
    /** */
    static searchOrders(searchterm: string, searchKey: string): Promise<Order[]>;
    /** */
    static deleteOrders(credentials: IdeleteCredentialsPayRel[]): Promise<Isuccess>;
    /** */
    static getOrders(url?: string, offset?: number, limit?: number): Promise<Order[]>;
    /** */
    static getOneOrder(id: string): Promise<Order>;
    /** */
    static makeOrder(paymentRelated: IpaymentRelated, invoiceRelated: IinvoiceRelated, order: Iorder, payment: Ipayment, bagainCred: IbagainCredential, nonce?: any): Promise<Isuccess>;
    /** */
    static createOrder(paymentRelated: IpaymentRelated, invoiceRelated: IinvoiceRelated, order: Iorder, payment: Ipayment, bagainCred: IbagainCredential, nonce?: any): Promise<Isuccess>;
    /** */
    updateOrder(updatedOrder: Iorder, paymentRelated: IpaymentRelated, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /** */
    appendDelivery(status: TorderStatus): Promise<Isuccess>;
}
