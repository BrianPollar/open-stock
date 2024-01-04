import { InvoiceRelatedWithReceipt } from './invoice.define';
import { Iaddress, IbagainCredential, Ibilling, IdeleteCredentialsPayRel, IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Isuccess, TpaymentMethod } from '@open-stock/stock-universal';
export declare class PaymentRelated extends InvoiceRelatedWithReceipt {
    paymentRelated: string;
    urId: string;
    /** The user's company ID. */
    companyId: string;
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
     * @param companyId - The ID of the company
     * @param paymentRelated - The payment related data.
     * @param invoiceRelated - The invoice related data.
     * @param order - The order data.
     * @param payment - The payment data.
     * @param bagainCred - The bagain credential data.
     * @param nonce - The payment nonce.
     * @returns A Promise that resolves to a success object.
     */
    static createPayment(companyId: string, paymentRelated: IpaymentRelated, invoiceRelated: IinvoiceRelated, order: Iorder, payment: Ipayment, bagainCred: IbagainCredential | null, nonce?: any): Promise<Isuccess>;
    /**
     * Searches for payments.
     * @param companyId - The ID of the company
     * @param searchterm - The search term.
     * @param searchKey - The search key.
     * @returns A Promise that resolves to an array of Payment objects.
     */
    static searchPayments(companyId: string, searchterm: string, searchKey: string): Promise<Payment[]>;
    /**
     * Retrieves payments.
     * @param companyId - The ID of the company
     * @param url - The URL to retrieve payments from.
     * @param offset - The offset to start retrieving payments from.
     * @param limit - The maximum number of payments to retrieve.
     * @returns A Promise that resolves to an array of Payment objects.
     */
    static getPayments(companyId: string, url?: string, offset?: number, limit?: number): Promise<Payment[]>;
    /**
     * Retrieves a single payment.
     * @param companyId - The ID of the company
     * @param id - The ID of the payment to retrieve.
     * @returns A Promise that resolves to a Payment object.
     */
    static getOnePayment(companyId: string, id: string): Promise<Payment>;
    /**
     * Deletes multiple payments.
     * @param companyId - The ID of the company
     * @param credentials - The credentials to delete the payments.
     * @returns A Promise that resolves to a success object.
     */
    static deletePayments(companyId: string, credentials: IdeleteCredentialsPayRel[]): Promise<Isuccess>;
    /**
     * Updates a payment.
     * @param companyId - The ID of the company
     * @param updatedPayment - The updated payment data.
     * @param paymentRelated - The updated payment related data.
     * @param invoiceRelated - The updated invoice related data.
     * @returns A Promise that resolves to a success object.
     */
    updatePayment(companyId: string, updatedPayment: Ipayment, paymentRelated: IpaymentRelated, invoiceRelated: IinvoiceRelated): Promise<Isuccess>;
    /**
     * Deletes a payment.
     * @param companyId - The ID of the company
     * @returns A Promise that resolves to a success object.
     */
    deletePayment(companyId: string): Promise<Isuccess>;
}
