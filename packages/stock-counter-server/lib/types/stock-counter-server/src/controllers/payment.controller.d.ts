import { IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Isuccess, TpayType } from '@open-stock/stock-universal';
import { IorderResponse } from 'pesapal3';
/** Interface for the response of the payOnDelivery function */
export interface IpayResponse extends Isuccess {
    /** The tracking ID for the PesaPal order */
    pesaPalorderTrackingId?: string;
}
/**
 * Allows payment on delivery
 * @param paymentRelated - The payment related information
 * @param invoiceRelated - The invoice related information
 * @param order - The order information
 * @param payment - The payment information
 * @param userId - The user ID
 * @param locaLMailHandler - The email handler
 * @returns A promise that resolves to an Isuccess object
 */
export declare const payOnDelivery: (paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, order: Iorder, payment: Ipayment, userId: string, companyId: string) => Promise<Isuccess>;
export declare const paymentMethodDelegator: (paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, type: string, order: Iorder, payment: Ipayment, userId: string, companyId: string, burgain: {
    state: boolean;
    code: string;
}, payType?: TpayType) => Promise<IpayResponse & {
    status?: number;
    errmsg?: string;
}>;
/**
 * Submits a Pesapal payment order.
 * @param paymentRelated - The required payment related information.
 * @param invoiceRelated - The required invoice related information.
 * @param type - The type of payment.
 * @param order - The order details.
 * @param payment - The payment details.
 * @param userId - The ID of the user.
 * @param companyId - The ID of the company.
 * @param burgain - The burgain details.
 * @returns A promise that resolves to an object containing the success status, status code, and the Pesapal order response.
 */
export declare const relegatePesapalPayment: (paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, type: string, order: Iorder, payment: Ipayment, userId: string, companyId: string) => Promise<{
    success: boolean;
    err?: string;
    fileUrl?: string;
    status: number;
    pesapalOrderRes?: undefined;
    paymentRelated?: undefined;
} | {
    success: boolean;
    status: number;
    pesapalOrderRes: IorderResponse;
    paymentRelated: any;
}>;
