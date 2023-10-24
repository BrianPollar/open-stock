/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { lastValueFrom } from 'rxjs';
import { IdeleteCredentialsInvRel, Iinvoice, IinvoiceRelated, Isuccess } from '@open-stock/stock-universal';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelated, Receipt } from './receipt.define';


export class InvoiceRelatedWithReceipt
  extends InvoiceRelated {
  /** */
  payments: Receipt[] = [];

  constructor(data: Required<IinvoiceRelated>) {
    super(data);
    if (data.payments?.length) {
      this.payments = data.payments
        .map(val => new Receipt(val));
      this.paymentMade = this.payments
        .reduce((acc, val) => acc + val.amount, 0);
    }
  }
}


/** */
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
    /**
     * @todo Uncomment this code block to include items in the invoice.
     */
    // if (data.items) {
    //   this.items = data.items
    //     .map(val => ProductBase.constructProduct(StockCounterClient.ehttp, val));
    // }
  }

  /**
   * Retrieves all invoices.
   * @param url - The URL to retrieve the invoices from.
   * @param offset - The offset to start retrieving invoices from.
   * @param limit - The maximum number of invoices to retrieve.
   * @returns An array of invoices.
   */
  static async getInvoices(
    url = 'getall',
    offset = 0,
    limit = 0
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoice/${url}/${offset}/${limit}`);
    const invoices = await lastValueFrom(observer$) as Required<Iinvoice>[];
    return invoices
      .map(val => new Invoice(val));
  }

  /**
   * Retrieves a single invoice.
   * @param invoiceId - The ID of the invoice to retrieve.
   * @returns An instance of Invoice.
   */
  static async getOneInvoice(
    invoiceId: number
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/invoice/getone/${invoiceId}`);
    const invoice = await lastValueFrom(observer$) as Required<Iinvoice>;
    return new Invoice(invoice);
  }

  /**
   * Adds an invoice.
   * @param invoice - The invoice to add.
   * @param invoiceRelated - The related invoice.
   * @returns A success message.
   */
  static async addInvoice(
    invoice: Iinvoice,
    invoiceRelated: IinvoiceRelated
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost('/invoice/create', { invoice, invoiceRelated });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple invoices.
   * @param credentials - The credentials to delete the invoices.
   * @returns A success message.
   */
  static async deleteInvoices(
    credentials: IdeleteCredentialsInvRel[]
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut('/invoice/deletemany', { credentials });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Updates an invoice.
   * @param updatedInvoice - The updated invoice.
   * @param invoiceRelated - The related invoice.
   * @returns A success message.
   */
  async update(updatedInvoice: Iinvoice, invoiceRelated: IinvoiceRelated) {
    updatedInvoice._id = this._id;
    const observer$ = StockCounterClient.ehttp
      .makePut('/invoice/update', { updatedInvoice, invoiceRelated });
    return await lastValueFrom(observer$) as Isuccess;
  }
}
