import { Iaddress, IbagainCredential, Ibilling, IdataArrayResponse, IdeleteCredentialsPayRel, IinvoiceRelated, Iorder, Ipayment, IpaymentRelated, Isuccess, TpaymentMethod } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';


export class PaymentRelated
  extends InvoiceRelatedWithReceipt {
  paymentRelated: string;
  urId: string;

  /** The user's company ID. */
  companyId: string;
  orderDate: Date;
  paymentDate: Date;
  billingAddress: Ibilling;
  shippingAddress: Iaddress;
  override currency: string;
  user;
  isBurgain: boolean;
  shipping: number;
  manuallyAdded: boolean;
  paymentMethod: TpaymentMethod; // momo, airtelmoney or braintree

  /**
   * Constructs a new instance of the Payment class.
   * @param data The required data for the Payment object.
   */
  constructor(data: Required<IpaymentRelated>) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
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
  static async createPayment(
    companyId: string,
    paymentRelated: IpaymentRelated,
    invoiceRelated: IinvoiceRelated,
    order: Iorder,
    payment: Ipayment,
    bagainCred: IbagainCredential | null,
    nonce?
  ) {
    const observer$ = StockCounterClient.ehttp.makePost(`/payment/create/${companyId}`, {
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
   * @param companyId - The ID of the company
   * @param searchterm - The search term.
   * @param searchKey - The search key.
   * @returns A Promise that resolves to an array of Payment objects.
   */
  static async searchPayments(
    companyId: string,
    searchterm: string,
    searchKey: string
  ) {
    const observer$ = StockCounterClient.ehttp.makePost(`/payment/search/${companyId}`, { searchterm, searchKey });
    const payments = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: payments.count,
      payments: payments.data.map(val => new Payment(val as Required<Ipayment>)) };
  }

  /**
   * Retrieves payments.
   * @param companyId - The ID of the company
   * @param url - The URL to retrieve payments from.
   * @param offset - The offset to start retrieving payments from.
   * @param limit - The maximum number of payments to retrieve.
   * @returns A Promise that resolves to an array of Payment objects.
   */
  static async getPayments(
    companyId: string,
    url = 'getall',
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/payment/${url}/${offset}/${limit}/${companyId}`);
    const payments = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: payments.count,
      payments: payments.data.map(val => new Payment(val as Required<Ipayment>))
    };
  }

  /**
   * Retrieves a single payment.
   * @param companyId - The ID of the company
   * @param id - The ID of the payment to retrieve.
   * @returns A Promise that resolves to a Payment object.
   */
  static async getOnePayment(
    companyId: string,
    id: string
  ) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/payment/getone/${id}/${companyId}`);
    const payment = await lastValueFrom(observer$) as Required<Ipayment>;

    return new Payment(payment);
  }

  /**
   * Deletes multiple payments.
   * @param companyId - The ID of the company
   * @param credentials - The credentials to delete the payments.
   * @returns A Promise that resolves to a success object.
   */
  static async deletePayments(
    companyId: string,
    credentials: IdeleteCredentialsPayRel[]
  ) {
    const observer$ = StockCounterClient.ehttp.makePut(`/payment/deletemany/${companyId}`, { credentials });

    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates a payment.
   * @param companyId - The ID of the company
   * @param updatedPayment - The updated payment data.
   * @param paymentRelated - The updated payment related data.
   * @param invoiceRelated - The updated invoice related data.
   * @returns A Promise that resolves to a success object.
   */
  async updatePayment(
    companyId: string,
    updatedPayment: Ipayment,
    paymentRelated: IpaymentRelated,
    invoiceRelated: IinvoiceRelated
  ) {
    const observer$ = StockCounterClient.ehttp.makePut(`/payment/update/${companyId}`, { updatedPayment, paymentRelated, invoiceRelated });

    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes a payment.
   * @param companyId - The ID of the company
   * @returns A Promise that resolves to a success object.
   */
  async deletePayment(companyId: string) {
    const observer$ = StockCounterClient.ehttp.makeDelete(`/payment/deleteone/${this._id}/${companyId}`);

    return await lastValueFrom(observer$) as Isuccess;
  }
}

