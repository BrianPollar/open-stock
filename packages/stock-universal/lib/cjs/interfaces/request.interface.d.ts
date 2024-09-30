import { Request } from 'express';
import * as core from 'express-serve-static-core';
import { Iauthtoken } from './auth.interface';
import { IbagainCredential, Icompany, IfileMeta, Iorder, Ipayment, IpaymentRelated, Iuser } from './general.interface';
import { Iestimate, Iinvoice, IinvoiceRelated, Ireceipt } from './inventory.interface';
import { Icustomer, Istaff } from './user.interface';
/**
 * Represents a custom request that extends the base Request interface.
 */
export interface IcustomRequest<P extends Partial<core.ParamsDictionary>, T> extends Request<P> {
    user?: Iauthtoken;
    body: T;
}
export interface IcustomRequestSocial extends Request {
    user?: {
        id: string;
        username: string;
        name: string;
        photo: string;
        email: string;
        phone: string;
    };
}
export interface IeditCompany {
    company: Icompany;
    user: Partial<Iuser>;
}
export interface IeditCustomer {
    customer: Icustomer;
    user: Partial<Iuser>;
}
export interface IdeleteMany {
    _ids: string[];
}
export interface IdeleteOne {
    _id: string;
}
export interface IeditStaff {
    staff: Istaff;
    user: Partial<Iuser>;
}
export interface IeditEstimate {
    estimate: Iestimate;
    invoiceRelated: IinvoiceRelated;
}
export interface IeditInvoice {
    invoice: Iinvoice;
    invoiceRelated: IinvoiceRelated;
}
export interface IcreateOrder {
    paymentRelated: IpaymentRelated;
    invoiceRelated: IinvoiceRelated;
    order: Iorder;
    payment: Ipayment;
    bagainCred: IbagainCredential | null;
    nonce?: any;
}
export interface ImakeOrder extends IcreateOrder {
    user: Partial<Iuser>;
}
export interface IupdateOrder {
    order: Iorder;
    paymentRelated: IpaymentRelated;
    invoiceRelated: IinvoiceRelated;
}
export interface IupdatePay {
    payment: Ipayment;
    paymentRelated: IpaymentRelated;
    invoiceRelated: IinvoiceRelated;
}
export interface IupdateInvoicePayment {
    invoice: Iinvoice;
    invoiceRelated: IinvoiceRelated;
}
export interface IeditReceipt {
    receipt: Ireceipt;
    invoiceRelated: IinvoiceRelated;
}
export interface IreqHasPhotos {
    profilePic?: string;
    coverPic?: string;
    newPhotos?: string[] | IfileMeta[];
}
