import {
  DatabaseAuto, IdataArrayResponse,
  IdeleteMany, Iexpense, IfilterProps,
  IsubscriptionFeatureState, Isuccess,
  TexpenseCategory
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';

export class Expense
  extends DatabaseAuto {
  urId: string;
  companyId?: string;
  name: string;
  person: string;
  cost: number;
  category: TexpenseCategory;
  note: string;
  items: Item[];
  readonly currency: string;

  constructor(data: Iexpense) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.name = data.name;
    this.person = data.person;
    this.cost = data.cost;
    this.category = data.category;
    this.note = data.note;
    if (data.items) {
      this.items = data.items.map((val) => new Item(val));
    }

    this.currency = data.currency;
  }

  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Iexpense>>(`/expense/all/${offset}/${limit}`);
    const expenses = await lastValueFrom(observer$);

    return {
      count: expenses.count,
      expenses: expenses.data.map((val) => new Expense(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<Iexpense>>('/expense/filter', filter);
    const expenses = await lastValueFrom(observer$);

    return {
      count: expenses.count,
      expenses: expenses.data.map((val) => new Expense(val))
    };
  }

  static async getOne(urIdOr_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Iexpense>(`/expense/one/${urIdOr_id}`);
    const expense = await lastValueFrom(observer$);

    return new Expense(expense);
  }

  static add(vals: Iexpense) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IsubscriptionFeatureState>('/expense/add', vals);

    return lastValueFrom(observer$);
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/expense/delete/many', vals);

    return lastValueFrom(observer$);
  }

  update(vals: Iexpense) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/expense/update', vals);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp.makeDelete<Isuccess>(`/expense/delete/one/${this._id}`);

    return lastValueFrom(observer$);
  }
}
