import { Iaddress, Ibilling, IcreateOrder, IdeleteCredentialsPayRel, IfilterProps, Ipayment, IpaymentRelated, Isuccess, IupdatePay, TpaymentMethod } from '@open-stock/stock-universal';
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
    /**
     * Constructs a new instance of the Payment class.
     * @param data The required data for the Payment object.
     */
    constructor(data: Required<IpaymentRelated>);
}
/**
 * Represents a payment object.
 * @extends PaymentRelated
 */
export declare class Payment extends PaymentRelated {
    /** The order ID associated with the payment. */
    order: string;
    /**
     * Creates a new Payment object.
     * @param data - The payment data.
     */
    constructor(data: Required<Ipayment>);
    /**
     * Creates a new payment.
  
     * @param paymentRelated - The payment related data.
     * @param invoiceRelated - The invoice related data.
     * @param order - The order data.
     * @param payment - The payment data.
     * @param bagainCred - The bagain credential data.
     * @param nonce - The payment nonce.
     * @returns A Promise that resolves to a success object.
     */
    static add(vals: IcreateOrder): Promise<Isuccess>;
    /**
     * Retrieves payments.
  
     * @param url - The URL to retrieve payments from.
     * @param offset - The offset to start retrieving payments from.
     * @param limit - The maximum number of payments to retrieve.
     * @returns A Promise that resolves to an array of Payment objects.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        payments: Payment[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        payments: Payment[];
    }>;
    /**
     * Retrieves a single payment.
  
     * @param _id - The ID of the payment to retrieve.
     * @returns A Promise that resolves to a Payment object.
     */
    static getOne(_id: string): Promise<Payment>;
    /**
     * Deletes multiple payments.
  
     * @param credentials - The credentials to delete the payments.
     * @returns A Promise that resolves to a success object.
     */
    static removeMany(credentials: IdeleteCredentialsPayRel[]): Promise<Isuccess>;
    /**
     * Updates a payment.
  
     * @param updatedPayment - The updated payment data.
     * @param paymentRelated - The updated payment related data.
     * @param invoiceRelated - The updated invoice related data.
     * @returns A Promise that resolves to a success object.
     */
    update(vals: IupdatePay): Promise<Isuccess>;
    /**
     * Deletes a payment.
  
     * @returns A Promise that resolves to a success object.
     */
    remove(): Promise<Isuccess>;
}
