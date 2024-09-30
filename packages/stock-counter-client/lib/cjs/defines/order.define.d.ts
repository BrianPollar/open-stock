import { IcreateOrder, IdeleteCredentialsPayRel, IfilterProps, ImakeOrder, Iorder, Isuccess, IupdateOrder, TorderStatus } from '@open-stock/stock-universal';
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
     * Deletes multiple orders.
  
     * @param credentials - The credentials to use for authentication.
     * @returns An object indicating whether the deletion was successful.
     */
    static removeMany(credentials: IdeleteCredentialsPayRel[]): Promise<Isuccess>;
    /**
     * Gets a list of orders.
  
     * @param url - The URL to use for the request.
     * @param offset - The offset to use for pagination.
     * @param limit - The limit to use for pagination.
     * @returns An array of orders.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        orders: Order[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        orders: Order[];
    }>;
    /**
     * Gets a single order by ID.
  
     * @param _id - The ID of the order to get.
     * @returns The order with the specified ID.
     */
    static getOne(_id: string): Promise<Order>;
    /**
     * Creates a new order.
  
     * @param paymentRelated - The payment related information for the order.
     * @param invoiceRelated - The invoice related information for the order.
     * @param order - The order information.
     * @param payment - The payment information.
     * @param bagainCred - The bagain credential information.
     * @param nonce - The nonce to use for the request.
     * @returns An object indicating whether the creation was successful.
     */
    static directOrder(vals: ImakeOrder): Promise<Isuccess>;
    /**
     * Creates a new order.
  
     * @param paymentRelated - The payment related information for the order.
     * @param invoiceRelated - The invoice related information for the order.
     * @param order - The order information.
     * @param payment - The payment information.
     * @param bagainCred - The bagain credential information.
     * @param nonce - The nonce to use for the request.
     * @returns An object indicating whether the creation was successful.
     */
    static add(vals: IcreateOrder): Promise<Isuccess>;
    /**
     * Updates the order with new information.
  
     * @param updatedOrder - The updated order information.
     * @param paymentRelated - The updated payment related information.
     * @param invoiceRelated - The updated invoice related information.
     * @returns An object indicating whether the update was successful.
     */
    update(vals: IupdateOrder): Promise<Isuccess>;
    /**
     * Appends delivery information to the order.
  
     * @param status - The status to append.
     * @returns An object indicating whether the operation was successful.
     */
    updateDeliveryStatus(status: TorderStatus): Promise<Isuccess>;
}
