import { IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Isuccess } from '@open-stock/stock-universal';
import { EmailHandler } from '@open-stock/stock-notif-server';
import { PesaPalController, IorderResponse } from 'pesapal3';
/** */
export interface IpayResponse extends Isuccess {
    /** */
    pesaPalorderTrackingId?: string;
}
/** */
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
