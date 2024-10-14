import {
  IdataArrayResponse,
  IdeleteMany,
  IeditInvoice,
  IfilterProps, Iinvoice, IinvoiceRelated, IsubscriptionFeatureState, Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelated, Receipt } from './receipt.define';

export class InvoiceRelatedWithReceipt
  extends InvoiceRelated {
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

  static async getInvoiceRelateds(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Required<IinvoiceRelated>>>(`/invoicerelated/all/${offset}/${limit}`);
    const invoiceRelateds = await lastValueFrom(observer$);

    return {
      count: invoiceRelateds.count,
      invoiceRelateds: invoiceRelateds.data
        .map(val => new InvoiceRelatedWithReceipt(val))
    };
  }

  static async filterInvoiceRelateds(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<Required<IinvoiceRelated>>>('/invoicerelated/filter', filter);
    const invoiceRelateds = await lastValueFrom(observer$);

    return {
      count: invoiceRelateds.count,
      invoiceRelateds: invoiceRelateds.data
        .map(val => new InvoiceRelatedWithReceipt(val))
    };
  }

  static async getOneInvoiceRelated(_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Required<IinvoiceRelated>>(`/invoicerelated/one/${_id}`);
    const invoiceRelated = await lastValueFrom(observer$);

    return new InvoiceRelatedWithReceipt(invoiceRelated);
  }
}


export class Invoice
  extends InvoiceRelatedWithReceipt {
  dueDate: Date;
  urId: string;

  constructor(data: Required<Iinvoice>) {
    super(data);
    this.dueDate = data.dueDate;
    this.urId = data.urId;
  }

  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Required<Iinvoice>>>(`/invoice/all/${offset}/${limit}`);
    const invoices = await lastValueFrom(observer$);

    return {
      count: invoices.count,
      invoices: invoices.data
        .map(val => new Invoice(val)) };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<Required<Iinvoice>>>('/invoice/filter', filter);
    const invoices = await lastValueFrom(observer$);

    return {
      count: invoices.count,
      invoices: invoices.data
        .map(val => new Invoice(val)) };
  }

  static async getOne(urIdOr_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Required<Iinvoice>>(`/invoice/one/${urIdOr_id}`);
    const invoice = await lastValueFrom(observer$);

    return new Invoice(invoice);
  }

  static async add(vals: IeditInvoice) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/invoice/add', vals);

    return await lastValueFrom(observer$) as IsubscriptionFeatureState;
  }

  static removeMany(val: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/invoice/delete/many', val);

    return lastValueFrom(observer$);
  }

  update(vals: IeditInvoice) {
    vals.invoice._id = this._id;
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/invoice/update', vals);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>(`/invoice/delete/one/${this._id}`);

    return lastValueFrom(observer$);
  }
}
