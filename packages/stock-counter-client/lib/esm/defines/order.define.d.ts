import { IbagainCredential, IdeleteCredentialsPayRel, IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Isuccess, TorderStatus } from '@open-stock/stock-universal';
import { PaymentRelated } from './payment.define';
/**
 * Represents an order with payment and delivery information.
 * @extends PaymentRelated
 */
export declare class Order extends PaymentRelated {
    /** The initial price of the order. */
    price: number;
    /** The delivery date of the order. */
    deliveryDate: Date;
    /**
     * Creates a new Order instance.
     * @param data - The data to initialize the order with.
     */
    constructor(data: Required<Iorder>);
    /**
     * Searches for orders based on a search term and key.
     * @param companyId - The ID of the company
     * @param searchterm - The search term to use.
     * @param searchKey - The search key to use.
     * @returns An array of orders that match the search criteria.
     */
    static searchOrders(companyId: string, searchterm: string, searchKey: string): Promise<Order[]>;
    /**
     * Deletes multiple orders.
     * @param companyId - The ID of the company
     * @param credentials - The credentials to use for authentication.
     * @returns An object indicating whether the deletion was successful.
     */
    static deleteOrders(companyId: string, credentials: IdeleteCredentialsPayRel[]): Promise<Isuccess>;
    /**
     * Gets a list of orders.
     * @param companyId - The ID of the company
     * @param url - The URL to use for the request.
     * @param offset - The offset to use for pagination.
     * @param limit - The limit to use for pagination.
     * @returns An array of orders.
     */
    static getOrders(companyId: string, url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        orders: Order[];
    }>;
    /**
     * Gets a single order by ID.
     * @param companyId - The ID of the company
     * @param id - The ID of the order to get.
     * @returns The order with the specified ID.
     */
    static getOneOrder(companyId: string, id: string): Promise<Order>;
    /**
     * Creates a new order.
     * @param companyId - The ID of the company
     * @param paymentRelated - The payment related information for the order.
     * @param invoiceRelated - The invoice related information for the order.
     * @param order - The order information.
     * @param payment - The payment information.
     * @param bagainCred - The bagain credential information.
     * @param nonce - The nonce to use for the request.
     * @returns An object indicating whether the creation was successful.
     */
    static makeOrder(companyId: string, paymentRelated: IpaymentRelated, invoiceRelated: IinvoiceRelated, order: Iorder, payment: Ipayment, bagainCred: IbagainCredential | null, nonce?: any): Promise<Isuccess>;
    /**
     * Creates a new order.
     * @param companyId - The ID of the company
     * @param paymentRelated - The payment related information for the order.
     * @param invoiceRelated - The invoice related information for the order.
     * @param order - The order information.
     * @param payment - The payment information.
     * @param bagainCred - The bagain credential information.
     * @param nonce - The nonce to use for the request.
     * @returns An object indicating whether the creation was successful.
     */
    static createOrder(companyId: string, paymentRelated: IpaymentRelated, invoiceRelated: IinvoiceRelated, order: Iorder, payment: Ipayment, bagainCred: IbagainCredential | null, nonce?: any): Promise<Isuccess>;
    /**
     * Updates the order with new information.
     * @param companyId - The ID of the company
     * @param updatedOrder - The updated order information.
     * @param paymentRelated - The updated payment related information.
     * @param invoiceRelated - The updated invoice related information.
     * @returns An object indicating whether the update was successful.
     */
    updateOrder(companyId: string, updatedOrder: Iorder, paymentRelated: IpaymentRelated, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /**
     * Appends delivery information to the order.
     * @param companyId - The ID of the company
     * @param status - The status to append.
     * @returns An object indicating whether the operation was successful.
     */
    appendDelivery(companyId: string, status: TorderStatus): Promise<Isuccess>;
}
