
import {
  DatabaseAuto, IdataArrayResponse,
  IdeleteMany, IexpenseReport,
  IfilterProps, Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Expense } from '../expense.define';

export class ExpenseReport
  extends DatabaseAuto {
  urId: string;
  companyId: string;
  totalAmount: number;
  date: Date;
  expenses: Expense[];
  readonly currency: string;

  constructor(data: IexpenseReport) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.totalAmount = data.totalAmount;
    this.date = data.date;
    if (data.expenses) {
      this.expenses = data.expenses.map((val) => new Expense(val));
    }

    this.currency = data.currency;
  }

  static async getAll(
    offset = 0,
    limit = 10
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<IexpenseReport>>(`/expensereport/all/${offset}/${limit}`);
    const expensereports = await lastValueFrom(observer$);

    return {
      count: expensereports.count,
      expensereports: expensereports.data.map((val) => new ExpenseReport(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<IexpenseReport>>('/expensereport/filter', filter);
    const expensereports = await lastValueFrom(observer$);

    return {
      count: expensereports.count,
      expensereports: expensereports.data.map((val) => new ExpenseReport(val))
    };
  }

  static async getOne(urId: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IexpenseReport>(`/expensereport/one/${urId}`);
    const expensereport = await lastValueFrom(observer$);

    return new ExpenseReport(expensereport);
  }

  static add(vals: IexpenseReport) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/expensereport/add', vals);

    return lastValueFrom(observer$);
  }

  static removeMany(val: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/expensereport/delete/many', val);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>(`/expensereport/delete/one/${this._id}`);

    return lastValueFrom(observer$);
  }
}
