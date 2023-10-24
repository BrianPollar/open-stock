/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { InvoiceRelatedWithReceipt } from './invoice.define';
import { Iaddress, IbagainCredential, Ibilling, IdeleteCredentialsPayRel, IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Isuccess, TpaymentMethod } from '@open-stock/stock-universal';
import { StockCounterClient } from '../stock-counter-client';

/** */
export class PaymentRelated
  extends InvoiceRelatedWithReceipt {
  paymentRelated: string;
  urId: string;
  orderDate: Date;
  paymentDate: Date;
  billingAddress: Ibilling;
  shippingAddress: Iaddress;
  currency: string;
  user;
  isBurgain: boolean;
  shipping: number;
  manuallyAdded: boolean;
  paymentMethod: TpaymentMethod; // momo, airtelmoney or braintree

  constructor(
    data: Required<IpaymentRelated>
  ) {
    super(data);
    this.urId = data.urId;
    this.paymentRelated = data.paymentRelated;
    this.creationType = data.creationType;
    this.orderDate = data.orderDate;
    this.paymentDate = data.paymentDate;
    this.billingAddress = data.billingAddress;
    this.shippingAddress = data.shippingAddress;
    this.tax = data.tax;
    this.currency = data.currency;
    this.isBurgain = data.isBurgain;
    this.shipping = data.shipping;
    this.manuallyAdded = data.manuallyAdded;
    this.status = data.status;
    this.paymentMethod = data.paymentMethod;
  }
}

/** */
/**
 * Represents a payment object.
 * @extends PaymentRelated
 */
export class Payment extends PaymentRelated {
  /** The order ID associated with the payment. */
  order: string;

  /**
   * Creates a new Payment object.
   * @param data - The payment data.
   */
  constructor(data: Required<Ipayment>) {
    super(data);
    this.order = data.order as string;
  }

  /**
   * Retrieves a Braintree client token.
   * @returns A Promise that resolves to a string containing the Braintree client token, or null if an error occurred.
   */
  static async getBrainTreeToken(): Promise<string | null> {
    const observer$ = StockCounterClient.ehttp.makePost('/payment/braintreeclenttoken', {});
    const token = await lastValueFrom(observer$) as any;
    return token.token as string;
  }

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
  static async createPayment(
    paymentRelated: IpaymentRelated,
    invoiceRelated: IinvoiceRelated,
    order: Iorder,
    payment: Ipayment,
    bagainCred: IbagainCredential,
    nonce?
  ) {
    const observer$ = StockCounterClient.ehttp.makePost('/payment/create', {
      paymentRelated,
      invoiceRelated,
      order,
      payment,
      bagainCred,
      nonce
    });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Searches for payments.
   * @param searchterm - The search term.
   * @param searchKey - The search key.
   * @returns A Promise that resolves to an array of Payment objects.
   */
  static async searchPayments(
    searchterm: string,
    searchKey: string
  ) {
    const observer$ = StockCounterClient.ehttp.makePost('/payment/search', { searchterm, searchKey });
    const payments = await lastValueFrom(observer$) as Required<Ipayment>[];
    return payments.map(val => new Payment(val));
  }

  /**
   * Retrieves payments.
   * @param url - The URL to retrieve payments from.
   * @param offset - The offset to start retrieving payments from.
   * @param limit - The maximum number of payments to retrieve.
   * @returns A Promise that resolves to an array of Payment objects.
   */
  static async getPayments(
    url = 'getall',
    offset = 0,
    limit = 0
  ) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/payment/${url}/${offset}/${limit}`);
    const payments = await lastValueFrom(observer$) as Required<Ipayment>[];
    return payments.map(val => new Payment(val));
  }

  /**
   * Retrieves a single payment.
   * @param id - The ID of the payment to retrieve.
   * @returns A Promise that resolves to a Payment object.
   */
  static async getOnePayment(
    id: string
  ) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/payment/getone/${id}`);
    const payment = await lastValueFrom(observer$) as Required<Ipayment>;
    return new Payment(payment);
  }

  /**
   * Deletes multiple payments.
   * @param credentials - The credentials to delete the payments.
   * @returns A Promise that resolves to a success object.
   */
  static async deletePayments(
    credentials: IdeleteCredentialsPayRel[]
  ) {
    const observer$ = StockCounterClient.ehttp.makePut('/payment/deletemany', { credentials });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates a payment.
   * @param updatedPayment - The updated payment data.
   * @param paymentRelated - The updated payment related data.
   * @param invoiceRelated - The updated invoice related data.
   * @returns A Promise that resolves to a success object.
   */
  async updatePayment(
    updatedPayment: Ipayment,
    paymentRelated: IpaymentRelated,
    invoiceRelated: IinvoiceRelated
  ) {
    const observer$ = StockCounterClient.ehttp.makePut('/payment/update', { updatedPayment, paymentRelated, invoiceRelated });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes a payment.
   * @returns A Promise that resolves to a success object.
   */
  async deletePayment() {
    const observer$ = StockCounterClient.ehttp.makeDelete(`/payment/deleteone/${this._id}`);
    return await lastValueFrom(observer$) as Isuccess;
  }
}

