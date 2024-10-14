import {
  DatabaseAuto, IdataArrayResponse,
  IdeleteMany, IfilterProps,
  IprofitAndLossReport, Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Expense } from '../expense.define';
import { InvoiceRelatedWithReceipt } from '../invoice.define';

export class ProfitAndLossReport
  extends DatabaseAuto {
  urId: string;
  companyId?: string;
  totalAmount: number;
  date: Date;
  expenses: Expense[];
  invoiceRelateds: InvoiceRelatedWithReceipt[];
  readonly currency: string;

  /**
   * Creates a new instance of ProfitAndLossReport.
   * @param data - The data to initialize the report with.
   */
  constructor(data: IprofitAndLossReport) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.totalAmount = data.totalAmount;
    this.date = data.date;
    if (data.expenses) {
      this.expenses = data.expenses.map(val => new Expense(val));
    }
    if (data.invoiceRelateds) {
      this.invoiceRelateds = data.invoiceRelateds.map(val => new InvoiceRelatedWithReceipt(val));
    }

    this.currency = data.currency;
  }


  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<IprofitAndLossReport>>(`/profitandlossreport/all/${offset}/${limit}`);
    const profitandlossreports = await lastValueFrom(observer$);

    return {
      count: profitandlossreports.count,
      profitandlossreports: profitandlossreports.data.map((val) => new ProfitAndLossReport(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<IprofitAndLossReport>>('/profitandlossreport/filter', filter);
    const profitandlossreports = await lastValueFrom(observer$);

    return {
      count: profitandlossreports.count,
      profitandlossreports: profitandlossreports.data.map((val) => new ProfitAndLossReport(val))
    };
  }

  static async getOne(urIdOr_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IprofitAndLossReport>(`/profitandlossreport/one/${urIdOr_id}`);
    const profitandlossreport = await lastValueFrom(observer$);

    return new ProfitAndLossReport(profitandlossreport);
  }

  static add(vals: IprofitAndLossReport) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/profitandlossreport/add', vals);

    return lastValueFrom(observer$);
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/profitandlossreport/delete/many', vals);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>('/profitandlossreport/delete/one');

    return lastValueFrom(observer$);
  }
}
