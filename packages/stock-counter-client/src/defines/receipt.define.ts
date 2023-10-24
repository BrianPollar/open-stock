/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  DatabaseAuto,
  IdeleteCredentialsInvRel,
  Iinvoice,
  IinvoiceRelated,
  IinvoiceRelatedPdct,
  Ireceipt,
  Isuccess,
  TestimateStage,
  TinvoiceStatus,
  TinvoiceType,
  TreceiptType
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';

/** The  InvoiceRelated  class is a subclass of the  DatabaseAuto  class and represents an invoice-related object. It has properties such as invoice related ID, creation type, estimate ID, invoice ID, billing user, items (an array of invoice-related product objects), billing user ID, billing user photo, stage, status, cost, payment made, tax, balance due, sub total, total, from date, to date, and payments (an array of payment install objects). The class also has methods for retrieving invoice-related objects from the server, adding and deleting invoice payments, and updating invoice payments. */
/**
 * Represents an invoice related to a receipt.
 */
export class InvoiceRelated extends DatabaseAuto {
  /** The ID of the invoice related to the receipt. */
  invoiceRelated: string;

  /** The type of invoice creation. */
  creationType: TinvoiceType;

  /** The ID of the estimate. */
  estimateId: number;

  /** The ID of the invoice. */
  invoiceId: number;

  /** The user who is being billed. */
  billingUser: string;

  /** Additional details about the company. */
  extraCompanyDetails: string;

  /** The items included in the invoice. */
  items: IinvoiceRelatedPdct[];

  /** The ID of the user being billed. */
  billingUserId: string;

  /** The photo of the user being billed. */
  billingUserPhoto: string;

  /** The stage of the estimate. */
  stage: TestimateStage;

  /** The status of the invoice. */
  status: TinvoiceStatus;

  /** The cost of the invoice. */
  cost: number;

  /** The amount of payment made on the invoice. */
  paymentMade: number;

  /** The tax amount for the invoice. */
  tax: number;

  /** The balance due on the invoice. */
  balanceDue: number;

  /** The subtotal of the invoice. */
  subTotal: number;

  /** The total amount of the invoice. */
  total: number;

  /** The start date of the invoice. */
  fromDate: Date;

  /** The end date of the invoice. */
  toDate: Date;

  /**
   * Creates a new instance of the InvoiceRelated class.
   * @param data The data to initialize the instance with.
   */
  constructor(data: Required<IinvoiceRelated>) {
    super(data);
    this.invoiceRelated = data.invoiceRelated;
    this.creationType = data.creationType;
    this.invoiceId = data.invoiceId;
    this.billingUser = data.billingUser;
    this.extraCompanyDetails = data.extraCompanyDetails;
    this.items = data.items;
    this.billingUserId = data.billingUserId;
    this.billingUserPhoto = data.billingUserPhoto;
    this.stage = data.stage;
    this.estimateId = data.estimateId;
    this.status = data.status;
    this.cost = data.cost;
    this.tax = data.tax;
    this.balanceDue = data.balanceDue;
    this.subTotal = data.subTotal;
    this.total = data.total;
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
  }

  /**
   * Gets all invoice related to receipts.
   * @param url The URL to get the invoice related to receipts from.
   * @param offset The offset to start getting invoice related to receipts from.
   * @param limit The maximum number of invoice related to receipts to get.
   * @returns An array of invoice related to receipts.
   */
  static async getInvoiceRelateds(
    url = 'getall',
    offset = 0,
    limit = 0
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoicerelated/${url}/${offset}/${limit}`);
    const invoiceRelateds = await lastValueFrom(observer$) as Required<IinvoiceRelated>[];
    return invoiceRelateds
      .map(val => new InvoiceRelatedWithReceipt(val));
  }

  /**
   * Searches for invoice related to receipts.
   * @param searchterm The search term to use.
   * @param searchKey The search key to use.
   * @param offset The offset to start getting invoice related to receipts from.
   * @param limit The maximum number of invoice related to receipts to get.
   * @returns An array of invoice related to receipts.
   */
  static async searchInvoiceRelateds(
    searchterm: string,
    searchKey: string,
    offset = 0,
    limit = 0
  ) {
    const body = {
      searchterm,
      searchKey
    };
    const observer$ = StockCounterClient.ehttp
      .makePost(`/invoicerelated/search/${offset}/${limit}`, body);
    const invoiceRelateds = await lastValueFrom(observer$) as Required<IinvoiceRelated>[];
    return invoiceRelateds
      .map(val => new InvoiceRelatedWithReceipt(val));
  }

  /**
   * Gets a single invoice related to a receipt.
   * @param id The ID of the invoice related to the receipt.
   * @returns The invoice related to the receipt.
   */
  static async getOneInvoiceRelated(
    id: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoicerelated/getone/${id}`);
    const invoiceRelated = await lastValueFrom(observer$) as Required<IinvoiceRelated>;
    return new InvoiceRelatedWithReceipt(invoiceRelated);
  }

  /**
   * Gets all invoice payments.
   * @returns An array of invoice payments.
   */
  static async getInvoicePayments() {
    const observer$ = StockCounterClient.ehttp
      .makeGet('/invoice/getallpayments');
    const invoicepays = await lastValueFrom(observer$) as Required<Ireceipt>[];
    return invoicepays
      .map(val => new Receipt(val));
  }

  /**
   * Gets a single invoice payment.
   * @param urId The ID of the invoice payment.
   * @returns The invoice payment.
   */
  static async getOneInvoicePayment(
    urId: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoice/getonepayment/${urId}`);
    const invoicepay = await lastValueFrom(observer$) as Required<Ireceipt>;
    return new Receipt(invoicepay);
  }

  /**
   * Adds an invoice payment.
   * @param payment The invoice payment to add.
   * @returns The success status of the operation.
   */
  static async addInvoicePayment(
    payment: Ireceipt
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost('/invoice/createpayment', payment);
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple invoice payments.
   * @param ids The IDs of the invoice payments to delete.
   * @returns The success status of the operation.
   */
  static async deleteInvoicePayments(
    ids: string[]
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut('/invoice/deletemanypayments', { ids });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates an invoice payment.
   * @param updatedInvoice The updated invoice.
   * @param invoiceRelated The related invoice.
   * @returns The success status of the operation.
   */
  static async updateInvoicePayment(updatedInvoice: Iinvoice, invoiceRelated: IinvoiceRelated) {
    const observer$ = StockCounterClient.ehttp
      .makePost('/invoice/updatepayment', { updatedInvoice, invoiceRelated });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates an invoice related to a receipt.
   * @param invoiceRelated The invoice related to the receipt to update.
   * @returns The success status of the operation.
   */
  static async updateInvoiceRelated(invoiceRelated: IinvoiceRelated) {
    const observer$ = StockCounterClient.ehttp
      .makePut('/invoicerelated/update', { invoiceRelated });
    return await lastValueFrom(observer$) as Isuccess;
  }
}

/** */
export class Receipt
  extends InvoiceRelated {
  /** */
  urId: string;

  /** */
  ammountRcievd: number;

  /** */
  paymentMode: string;

  /** */
  type: TreceiptType;

  /** */
  paymentInstall: string;

  date: Date;
  amount: number;

  /** */
  constructor(
    data: Required<Ireceipt>
  ) {
    super(data);
    this.urId = data.urId;
    this.ammountRcievd = data.ammountRcievd;
    this.paymentMode = data.paymentMode;
    this.type = data.type;
    this.date = data.toDate;
    this.amount = data.amount;
  }

  /** */
  static async getReceipts(
    url = 'getall',
    offset = 0,
    limit = 0
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/receipt/${url}/${offset}/${limit}`);
    const receipts = await lastValueFrom(observer$) as Required<Ireceipt>[];
    return receipts
      .map(val => new Receipt(val));
  }

  /** */
  static async getOneReceipt(
    urId: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/receipt/getone/${urId}`);
    const receipt = await lastValueFrom(observer$) as Required<Ireceipt>;
    return new Receipt(receipt);
  }

  /** */
  static async addReceipt(
    receipt: Ireceipt,
    invoiceRelated: IinvoiceRelated
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost('/receipt/create', { receipt, invoiceRelated });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /** */
  static async deleteReceipts(
    credentials: IdeleteCredentialsInvRel[]
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut('/receipt/deletemany', { credentials });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /** */
  async updateReciept(
    updatedReceipt: Ireceipt,
    invoiceRelated: IinvoiceRelated
  ) {
    updatedReceipt._id = this._id;
    const observer$ = StockCounterClient.ehttp
      .makePut('/receipt/update', { updatedReceipt, invoiceRelated });
    return await lastValueFrom(observer$) as Isuccess;
  }
}
