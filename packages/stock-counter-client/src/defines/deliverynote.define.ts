import {
  IdataArrayResponse,
  IdeleteMany,
  IfilterProps, IinvoiceRelated, IsubscriptionFeatureState, Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';

export class DeliveryNote
  extends InvoiceRelatedWithReceipt {
  urId: string;
  companyId: string;

  constructor(data) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
  }

  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<IinvoiceRelated>>(`/deliverynote/all/${offset}/${limit}`);
    const deliverynotes = await lastValueFrom(observer$);

    return {
      count: deliverynotes.count,
      deliverynotes: deliverynotes.data
        .map((val) => new DeliveryNote(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<IinvoiceRelated>>('/deliverynote/filter', filter);
    const deliverynotes = await lastValueFrom(observer$);

    return {
      count: deliverynotes.count,
      deliverynotes: deliverynotes.data
        .map((val) => new DeliveryNote(val))
    };
  }

  static async getOne(urId: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IinvoiceRelated>(`/deliverynote/one/${urId}`);
    const deliverynote = await lastValueFrom(observer$) ;

    return new DeliveryNote(deliverynote);
  }

  static add(invoiceRelated: IinvoiceRelated) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IsubscriptionFeatureState>('/deliverynote/add', invoiceRelated);

    return lastValueFrom(observer$);
  }

  static removeMany(val: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/deliverynote/delete/many', val); // TODO with IdeleteMany

    return lastValueFrom(observer$);
  }
}
