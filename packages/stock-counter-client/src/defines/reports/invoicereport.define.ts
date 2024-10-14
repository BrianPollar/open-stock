import {
  DatabaseAuto, IdataArrayResponse,
  IdeleteMany, IfilterProps, IinvoicesReport, Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Invoice } from '../invoice.define';

export class InvoiceReport
  extends DatabaseAuto {
  urId: string;
  companyId?: string;
  totalAmount: number;
  date: Date;
  invoices: Invoice[];
  readonly currency: string;

  constructor(data: IinvoicesReport) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.totalAmount = data.totalAmount;
    this.date = data.date;
    if (data.invoices) {
      this.invoices = data.invoices.map(val => new Invoice(val));
    }

    this.currency = data.currency;
  }

  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<IinvoicesReport>>(`/invoicesreport/all/${offset}/${limit}`);
    const invoicesreports = await lastValueFrom(observer$);

    return {
      count: invoicesreports.count,
      invoicesreports: invoicesreports.data.map((val) => new InvoiceReport(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<IinvoicesReport>>('/invoicesreport/filter', filter);
    const invoicesreports = await lastValueFrom(observer$);

    return {
      count: invoicesreports.count,
      invoicesreports: invoicesreports.data.map((val) => new InvoiceReport(val))
    };
  }

  static async getOne(urIdOr_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IinvoicesReport>(`/invoicesreport/one/${urIdOr_id}`);
    const invoicesreport = await lastValueFrom(observer$);

    return new InvoiceReport(invoicesreport);
  }

  static add(vals: IinvoicesReport) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/invoicesreport/add', vals);

    return lastValueFrom(observer$);
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/invoicesreport/delete/many', vals);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>(`/invoicesreport/delete/one/${this._id}`);

    return lastValueFrom(observer$);
  }
}
