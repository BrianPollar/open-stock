import {
  DatabaseAuto, IdataArrayResponse,
  IdeleteMany, IfilterProps, Isuccess,
  ItaxReport
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Estimate } from '../estimate.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';

export class TaxReport
  extends DatabaseAuto {
  urId: string;
  companyId: string;
  totalAmount: number;
  date: Date;
  estimates: Estimate[];
  invoiceRelateds: InvoiceRelatedWithReceipt[];
  readonly currency: string;

  constructor(data: ItaxReport) {
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
      .makeGet<IdataArrayResponse<ItaxReport>>(`/taxreport/all/${offset}/${limit}`);
    const taxreports = await lastValueFrom(observer$);

    return {
      count: taxreports.count,
      taxreports: taxreports.data.map((val) => new TaxReport(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<ItaxReport>>('/taxreport/filter', filter);
    const taxreports = await lastValueFrom(observer$);

    return {
      count: taxreports.count,
      taxreports: taxreports.data.map((val) => new TaxReport(val))
    };
  }

  static async getOne(urId: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<ItaxReport>(`/taxreport/one/${urId}`);
    const taxreport = await lastValueFrom(observer$);

    return new TaxReport(taxreport);
  }

  static add(vals: ItaxReport) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/taxreport/add', vals);

    return lastValueFrom(observer$);
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/taxreport/delete/many', vals);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>('/taxreport/delete/one');

    return lastValueFrom(observer$);
  }
}
