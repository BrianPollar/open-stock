import {
  IdataArrayResponse,
  IdeleteMany,
  IeditEstimate,
  Iestimate, IfilterProps, IinvoiceRelated,
  IsubscriptionFeatureState,
  Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';

export class Estimate
  extends InvoiceRelatedWithReceipt {
  override fromDate: Date;
  override toDate: Date;
  urId: string;

  constructor(data: Required<Iestimate>) {
    super(data);
    this.estimateId = data.estimateId;
    this.fromDate = data.fromDate;
    this.toDate = data.toDate;
    this.urId = data.urId;
  }

  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Required<Iestimate>>>(`/estimate/all/${offset}/${limit}`);
    const estimates = await lastValueFrom(observer$);

    return {
      count: estimates.count,
      estimates: estimates.data
        .map(val => new Estimate(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<Required<Iestimate>>>('/estimate/filter', filter);
    const estimates = await lastValueFrom(observer$);

    return {
      count: estimates.count,
      estimates: estimates.data
        .map(val => new Estimate(val))
    };
  }

  static async getOne(urIdOr_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Required<Iestimate>>(`/estimate/one/${urIdOr_id}`);
    const estimate = await lastValueFrom(observer$);

    return new Estimate(estimate);
  }

  static add(vals: IeditEstimate) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IsubscriptionFeatureState>('/estimate/add', vals);

    return lastValueFrom(observer$);
  }

  static removeMany(val: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/estimate/delete/many', val);

    return lastValueFrom(observer$);
  }

  updatePdt(vals: IinvoiceRelated) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>(
        '/estimate/updatepdt',
        { items: vals, _id: this._id }
      );

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>(`/estimate/delete/one/${this._id}`);

    return lastValueFrom(observer$);
  }
}
