import {
  DatabaseAuto, IdataArrayResponse, IdeleteCredentialsInvRel, Iinvoice, IinvoiceRelated,
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

  ecommerceSale = false;

  ecommerceSalePercentage = 0;

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
    this.ecommerceSale = data.ecommerceSale || false;
    this.ecommerceSalePercentage = data.ecommerceSalePercentage || 0;
  }

  /**
   * Gets all invoice payments.
   * @param companyId - The ID of the company
   * @returns An array of invoice payments.
   */
  static async getInvoicePayments(companyId: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoice/getallpayments/${companyId}`);
    const invoicepays = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: invoicepays.count,
      invoicepays: invoicepays.data
        .map(val => new Receipt(val as Required<Ireceipt>)) };
  }

  /**
   * Gets a single invoice payment.
   * @param companyId - The ID of the company
   * @param urId The ID of the invoice payment.
   * @returns The invoice payment.
   */
  static async getOneInvoicePayment(
    companyId: string,
    urId: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoice/getonepayment/${urId}/${companyId}`);
    const invoicepay = await lastValueFrom(observer$) as Required<Ireceipt>;

    return new Receipt(invoicepay);
  }

  /**
   * Adds an invoice payment.
   * @param companyId - The ID of the company
   * @param payment The invoice payment to add.
   * @returns The success status of the operation.
   */
  static async addInvoicePayment(
    companyId: string,
    payment: Ireceipt
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/invoice/createpayment/${companyId}`, payment);

    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple invoice payments.
   * @param companyId - The ID of the company
   * @param ids The IDs of the invoice payments to delete.
   * @returns The success status of the operation.
   */
  static async deleteInvoicePayments(
    companyId: string,
    ids: string[]
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/invoice/deletemanypayments/${companyId}`, { ids });

    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates an invoice payment.
   * @param companyId - The ID of the company
   * @param updatedInvoice The updated invoice.
   * @param invoiceRelated The related invoice.
   * @returns The success status of the operation.
   */
  static async updateInvoicePayment(companyId: string, updatedInvoice: Iinvoice, invoiceRelated: IinvoiceRelated) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/invoice/updatepayment/${companyId}`, { updatedInvoice, invoiceRelated });

    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates an invoice related to a receipt.
   * @param companyId - The ID of the company
   * @param invoiceRelated The invoice related to the receipt to update.
   * @returns The success status of the operation.
   */
  static async updateInvoiceRelated(companyId: string, invoiceRelated: IinvoiceRelated) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/invoicerelated/update/${companyId}`, { invoiceRelated });

    return await lastValueFrom(observer$) as Isuccess;
  }
}


export class Receipt
  extends InvoiceRelated {
  urId: string;

  /** The user's company ID. */
  companyId: string;
  ammountRcievd: number;
  paymentMode: string;
  type: TreceiptType;
  paymentInstall: string;
  date: Date;
  amount: number;

  /**
   * Constructs a new Receipt object.
   * @param data - The required data for the Receipt.
   */
  constructor(data: Required<Ireceipt>) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.ammountRcievd = data.ammountRcievd;
    this.paymentMode = data.paymentMode;
    this.type = data.type;
    this.date = data.toDate;
    this.amount = data.amount;
  }

  /**
   * Retrieves receipts for a specific company.
   * @param companyId - The ID of the company.
   * @param url - The URL for the API endpoint. Default value is 'getall'.
   * @param offset - The offset for pagination. Default value is 0.
   * @param limit - The limit for pagination. Default value is 0.
   * @returns An array of receipts.
   */
  static async getReceipts(
    companyId: string,
    url = 'getall',
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/receipt/${url}/${offset}/${limit}/${companyId}`);
    const receipts = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: receipts.count,
      receipts: receipts.data
        .map(val => new Receipt(val as Required<Ireceipt>))
    };
  }

  /**
   * Retrieves a single receipt based on the company ID and user ID.
   * @param companyId - The ID of the company.
   * @param urId - The ID of the user.
   * @returns A Promise that resolves to a new instance of the Receipt class.
   */
  static async getOneReceipt(
    companyId: string,
    urId: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/receipt/getone/${urId}/${companyId}`);
    const receipt = await lastValueFrom(observer$) as Required<Ireceipt>;

    return new Receipt(receipt);
  }

  /**
   * Adds a receipt to the system.
   * @param companyId - The ID of the company.
   * @param receipt - The receipt object to be added.
   * @param invoiceRelated - The related invoice information.
   * @returns A promise that resolves to the success response.
   */
  static async addReceipt(
    companyId: string,
    receipt: Ireceipt,
    invoiceRelated: IinvoiceRelated
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/receipt/create/${companyId}`, { receipt, invoiceRelated });

    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple receipts for a given company.
   * @param companyId - The ID of the company.
   * @param credentials - An array of delete credentials for each receipt.
   * @returns A promise that resolves to the success response.
   */
  static async deleteReceipts(
    companyId: string,
    credentials: IdeleteCredentialsInvRel[]
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/receipt/deletemany/${companyId}`, { credentials });

    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates a receipt.
   * @param companyId - The ID of the company.
   * @param updatedReceipt - The updated receipt object.
   * @param invoiceRelated - The invoice related object.
   * @returns A promise that resolves to the success response.
   */
  async updateReciept(
    companyId: string,
    updatedReceipt: Ireceipt,
    invoiceRelated: IinvoiceRelated
  ) {
    updatedReceipt._id = this._id;
    const observer$ = StockCounterClient.ehttp
      .makePut(`/receipt/update/${companyId}`, { updatedReceipt, invoiceRelated });

    return await lastValueFrom(observer$) as Isuccess;
  }
}
