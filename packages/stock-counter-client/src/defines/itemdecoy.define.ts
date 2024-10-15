import {
  DatabaseAuto, IdataArrayResponse, IdeleteMany, IfilterProps, Iitem, IitemDecoy, IsubscriptionFeatureState, Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { Item } from './item.define';

export class ItemDecoy
  extends DatabaseAuto {
  urId: string;
  companyId: string;
  items: Item[] = [];

  constructor(data: { urId: string; companyId: string; items: Iitem[] }) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.items = data.items.map(val => new Item(val)) || [];
  }

  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<IitemDecoy>>(`/itemdecoy/all/${offset}/${limit}`);
    const decoys = await lastValueFrom(observer$);

    return {
      count: decoys.count,
      decoys: decoys.data.map(val => new ItemDecoy(val)) };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<IitemDecoy>>('/itemdecoy/filter', filter);
    const decoys = await lastValueFrom(observer$);

    return {
      count: decoys.count,
      decoys: decoys.data.map(val => new ItemDecoy(val)) };
  }

  static async getOne(urIdOr_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IitemDecoy>(`/itemdecoy/one/${urIdOr_id}`);
    const decoy = await lastValueFrom(observer$);

    return new ItemDecoy(decoy);
  }

  static async add(
    how: 'automatic' | 'manual',
    itemdecoy: { itemId: string } | { items: string[] }
  ): Promise<IsubscriptionFeatureState> {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>(`/itemdecoy/add/${how}`, { itemdecoy });

    return await lastValueFrom(observer$) as IsubscriptionFeatureState;
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/itemdecoy/delete/many', vals);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp.makeDelete<Isuccess>(`/itemdecoy/delete/one/${this._id}`);

    return lastValueFrom(observer$);
  }
}
