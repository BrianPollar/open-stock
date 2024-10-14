import { IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Isuccess, TpayType } from '@open-stock/stock-universal';
/** Interface for the response of the payOnDelivery function */
export interface IpayResponse extends Isuccess {
    /** The tracking ID for the PesaPal order */
    pesaPalorderTrackingId?: string;
}
export declare const payOnDelivery: (res: any, paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, order: Iorder, payment: Ipayment, userId: string, companyId: string) => Promise<Isuccess>;
export declare const payWithWallet: (res: any, paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, order: Iorder, payment: Ipayment, userId: string, companyId: string) => Promise<Isuccess>;
/**
   * Handles payments based on the payment method.
   * @param res - The response object.
   * @param paymentRelated - The payment related information.
   * @param invoiceRelated - The invoice related information.
   * @param type - The payment method type.
   * @param order - The order information.
   * @param payment - The payment information.
   * @param userId - The user ID.
   * @param companyId - The company ID.
   * @param burgain - The burgain information.
   * @param payType - The payment type ('nonSubscription' or 'subscription').
   * @returns A promise that resolves to an object containing the success status and the payment ID, if successful.
   */
export declare const paymentMethodDelegator: (res: any, paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, type: string, order: Iorder, payment: Ipayment, userId: string, companyId: string, burgain: {
    state: boolean;
    code: string;
}, payType?: TpayType) => Promise<IpayResponse & {
    status?: number;
    errmsg?: string;
}>;
export declare const relegatePesapalPayment: (res: any, paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, type: string, order: Iorder, payment: Ipayment, userId: string, companyId: string) => Promise<{
    success: boolean;
    status: number;
    err: string;
} | import("pesapal3").IsubmitOrderRes | {
    success: boolean;
    status: number;
    errmsg: string;
    pesapalOrderRes?: undefined;
    paymentRelated?: undefined;
} | {
    success: boolean;
    status: number;
    pesapalOrderRes: null;
    paymentRelated: null;
    errmsg?: undefined;
} | {
    success: boolean;
    status: number;
    pesapalOrderRes: import("pesapal3").IorderResponse;
    paymentRelated: string;
    errmsg?: undefined;
}>;
/**
   * Tracks the status of a payment.
   * @param refereceId - The tracking ID of the payment.
   * @returns A promise that resolves to an object containing the success status and the order status.
   */
export declare const trackOrder: (refereceId: string) => Promise<{
    success: boolean;
    orderStatus?: undefined;
} | {
    success: boolean;
    orderStatus: import("@open-stock/stock-universal").TorderStatus | undefined;
}>;
