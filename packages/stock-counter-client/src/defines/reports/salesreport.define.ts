import {
  DatabaseAuto, IdataArrayResponse,
  IdeleteMany, IfilterProps, IsalesReport,
  Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';

export class SalesReport
  extends DatabaseAuto {
  urId: string;
  companyId: string;
  totalAmount: number;
  date: Date;
  estimates: Estimate[];
  invoiceRelateds: InvoiceRelatedWithReceipt[];
  readonly currency: string;

  constructor(data: IsalesReport) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.totalAmount = data.totalAmount;
    this.date = data.date;
    if (data.estimates) {
      this.estimates = data.estimates.map((val) => new Estimate(val));
    }
    if (data.invoiceRelateds) {
      this.invoiceRelateds = data.invoiceRelateds.map((val) => new InvoiceRelatedWithReceipt(val));
    }

    this.currency = data.currency;
  }

  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<IsalesReport>>(`/salesreport/all/${offset}/${limit}`);
    const salesreports = await lastValueFrom(observer$);

    return {
      count: salesreports.count,
      salesreports: salesreports.data.map((val) => new SalesReport(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<IsalesReport>>('/salesreport/filter', filter);
    const salesreports = await lastValueFrom(observer$);

    return {
      count: salesreports.count,
      salesreports: salesreports.data.map((val) => new SalesReport(val))
    };
  }

  static async getOne(urId: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IsalesReport>(`/salesreport/one/${urId}`);
    const salesreport = await lastValueFrom(observer$) ;

    return new SalesReport(salesreport);
  }

  static add(vals: IsalesReport) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/salesreport/add', vals);

    return lastValueFrom(observer$);
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/salesreport/delete/many', vals);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>('/salesreport/delete/one');

    return lastValueFrom(observer$);
  }
}
