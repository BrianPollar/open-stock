import { IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Isuccess } from '@open-stock/stock-universal';
import { EmailHandler } from '@open-stock/stock-notif-server';
import { PesaPalController, IorderResponse } from 'pesapal3';
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
 * @param notifRedirectUrl - The notification redirect URL
 * @param locaLMailHandler - The email handler
 * @returns A promise that resolves to an Isuccess object
 */
export declare const payOnDelivery: (paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, order: Iorder, payment: Ipayment, userId: string, notifRedirectUrl: string, locaLMailHandler: EmailHandler) => Promise<Isuccess>;
/** */
export declare const paymentMethodDelegator: (paymentInstance: PesaPalController, paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, type: string, order: Iorder, payment: Ipayment, userId: string, burgain: {
    state: boolean;
    code: string;
}, notifRedirectUrl: string, locaLMailHandler: EmailHandler) => Promise<IpayResponse & {
    status?: number;
    errmsg?: string;
}>;
/** */
export declare const relegatePesapalPayment: (paymentInstance: PesaPalController, paymentRelated: Required<IpaymentRelated>, invoiceRelated: Required<IinvoiceRelated>, type: string, order: Iorder, payment: Ipayment, userId: string, burgain: {
    state: boolean;
    code: string;
}, notifRedirectUrl: string, locaLMailHandler: EmailHandler) => Promise<{
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
/**
/** */
export declare const relegatePesaPalNotifications: (orderTrackingId: string, orderNotificationType: string, orderMerchantReference: string) => void;
