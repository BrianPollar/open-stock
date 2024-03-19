import { Isuccess } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';

export class CompanySubscription {
  subscriprionId: string;
  startDate: Date;
  endDate: Date;
  features: [];

  constructor(data) {
    this.subscriprionId = data.subscriprionId;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.features = data.features;
  }


  static async getCompanySubscriptions(
    companyId: string,
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/companysubscription/getall/${offset}/${limit}/${companyId}`);
    const companysubscriptions = await lastValueFrom(observer$) as unknown[];
    return companysubscriptions
      .map((val) => new CompanySubscription(val));
  }
  static async subscribe(
    companyId: string,
    companySubscription
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/companysubscription/subscribe/${companyId}`, companySubscription);
    return await lastValueFrom(observer$) as Isuccess;
  }

  static async deleteCompanySubscription(
    companyId: string,
    id: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/companysubscription/deleteone/${companyId}`, { id });
    return await lastValueFrom(observer$) as Isuccess;
  }
}
