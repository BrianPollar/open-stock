import { IdataArrayResponse, IdeleteCredentialsInvRel, Iinvoice, IinvoiceRelated, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelated, Receipt } from './receipt.define';


export class InvoiceRelatedWithReceipt
  extends InvoiceRelated {
  payments: Receipt[] = [];

  /**
   * Constructs a new instance of the Invoice class.
   * @param data The required data for the invoice.
   */
  constructor(data: Required<IinvoiceRelated>) {
    super(data);
    if (data.payments?.length) {
      this.payments = data.payments
        .map(val => new Receipt(val));
      this.paymentMade = this.payments
        .reduce((acc, val) => acc + val.amount, 0);
    }
  }

  /**
   * Gets all invoice related to receipts.
   * @param companyId - The ID of the company
   * @param url The URL to get the invoice related to receipts from.
   * @param offset The offset to start getting invoice related to receipts from.
   * @param limit The maximum number of invoice related to receipts to get.
   * @returns An array of invoice related to receipts.
   */
  static async getInvoiceRelateds(
    companyId: string,
    url = 'getall',
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoicerelated/${url}/${offset}/${limit}/${companyId}`);
    const invoiceRelateds = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: invoiceRelateds.count,
      invoiceRelateds: invoiceRelateds.data
        .map(val => new InvoiceRelatedWithReceipt(val as Required<IinvoiceRelated>))
    };
  }

  /**
   * Searches for invoice related to receipts.
   * @param companyId - The ID of the company
   * @param searchterm The search term to use.
   * @param searchKey The search key to use.
   * @param offset The offset to start getting invoice related to receipts from.
   * @param limit The maximum number of invoice related to receipts to get.
   * @returns An array of invoice related to receipts.
   */
  static async searchInvoiceRelateds(
    companyId: string,
    searchterm: string,
    searchKey: string,
    offset = 0,
    limit = 20
  ) {
    const body = {
      searchterm,
      searchKey
    };
    const observer$ = StockCounterClient.ehttp
      .makePost(`/invoicerelated/search/${offset}/${limit}/${companyId}`, body);
    const invoiceRelateds = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: invoiceRelateds.count,
      invoiceRelateds: invoiceRelateds.data
        .map(val => new InvoiceRelatedWithReceipt(val as Required<IinvoiceRelated>))
    };
  }

  /**
   * Gets a single invoice related to a receipt.
   * @param companyId - The ID of the company
   * @param id The ID of the invoice related to the receipt.
   * @returns The invoice related to the receipt.
   */
  static async getOneInvoiceRelated(
    companyId: string,
    id: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoicerelated/getone/${id}/${companyId}`);
    const invoiceRelated = await lastValueFrom(observer$) as Required<IinvoiceRelated>;

    return new InvoiceRelatedWithReceipt(invoiceRelated);
  }
}


/**
 * Represents an invoice related with a receipt.
 */
export class Invoice extends InvoiceRelatedWithReceipt {
  /** The due date of the invoice. */
  dueDate: Date;

  /**
   * Creates an instance of Invoice.
   * @param data - The required data to create an invoice.
   */
  constructor(data: Required<Iinvoice>) {
    super(data);
    this.dueDate = data.dueDate;
  }

  /**
   * Retrieves all invoices.
   * @param companyId - The ID of the company
   * @param url - The URL to retrieve the invoices from.
   * @param offset - The offset to start retrieving invoices from.
   * @param limit - The maximum number of invoices to retrieve.
   * @returns An array of invoices.
   */
  static async getInvoices(
    companyId: string,
    url = 'getall',
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoice/${url}/${offset}/${limit}/${companyId}`);
    const invoices = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: invoices.count,
      invoices: invoices.data
        .map(val => new Invoice(val as Required<Iinvoice>)) };
  }

  /**
   * Retrieves a single invoice.
   * @param companyId - The ID of the company
   * @param invoiceId - The ID of the invoice to retrieve.
   * @returns An instance of Invoice.
   */
  static async getOneInvoice(
    companyId: string,
    invoiceId: number
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoice/getone/${invoiceId}/${companyId}`);
    const invoice = await lastValueFrom(observer$) as Required<Iinvoice>;

    return new Invoice(invoice);
  }

  /**
   * Adds an invoice.
   * @param companyId - The ID of the company
   * @param invoice - The invoice to add.
   * @param invoiceRelated - The related invoice.
   * @returns A success message.
   */
  static async addInvoice(
    companyId: string,
    invoice: Iinvoice,
    invoiceRelated: IinvoiceRelated
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/invoice/create/${companyId}`, { invoice, invoiceRelated });

    return await lastValueFrom(observer$) as IsubscriptionFeatureState;
  }

  /**
   * Deletes multiple invoices.
   * @param companyId - The ID of the company
   * @param credentials - The credentials to delete the invoices.
   * @returns A success message.
   */
  static async deleteInvoices(
    companyId: string,
    credentials: IdeleteCredentialsInvRel[]
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/invoice/deletemany/${companyId}`, { credentials });

    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates an invoice.
   * @param companyId - The ID of the company
   * @param updatedInvoice - The updated invoice.
   * @param invoiceRelated - The related invoice.
   * @returns A success message.
   */
  async update(companyId: string, updatedInvoice: Iinvoice, invoiceRelated: IinvoiceRelated) {
    updatedInvoice._id = this._id;
    const observer$ = StockCounterClient.ehttp
      .makePut(`/invoice/update/${companyId}`, { updatedInvoice, invoiceRelated });

    return await lastValueFrom(observer$) as Isuccess;
  }
}
