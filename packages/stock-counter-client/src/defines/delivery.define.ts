import {
  DatabaseAuto, IdataArrayResponse,
  IdeleteMany,
  Ideliverycity, Isuccess, TpriceCurrenncy
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';

export class DeliveryCity
  extends DatabaseAuto {
  name: string;
  shippingCost: number;
  currency: TpriceCurrenncy;
  deliversInDays: number;

  constructor(data: Ideliverycity) {
    super(data);
    this.name = data.name;
    this.shippingCost = data.shippingCost;
    this.currency = data.currency;
    this.deliversInDays = data.deliversInDays;
  }

  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Ideliverycity>>(`/deliverycity/all/${offset}/${limit}`);
    const citys = await lastValueFrom(observer$);

    return {
      count: citys.count,
      citys: citys.data.map(val => new DeliveryCity(val))
    };
  }

  static async getOne(urIdOr_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Ideliverycity>(`/deliverycity/one/${urIdOr_id}`);
    const city = await lastValueFrom(observer$);

    return new DeliveryCity(city);
  }

  static add(deliverycity: Ideliverycity) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/deliverycity/add', {
        deliverycity
      });

    return lastValueFrom(observer$);
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/deliverycity/delete/many', vals);

    return lastValueFrom(observer$);
  }

  async update(vals: Ideliverycity) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/deliverycity/update', vals);
    const updated = await lastValueFrom(observer$);

    if (updated.success) {
      this.name = vals.name || this.name;
      this.shippingCost = vals.shippingCost || this.shippingCost;
      this.currency = vals.currency || this.currency;
      this.deliversInDays = vals.deliversInDays || this.deliversInDays;
    }

    return updated;
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>(`/deliverycity/delete/one/${this._id}`);

    return lastValueFrom(observer$);
  }
}
