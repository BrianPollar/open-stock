import { IdataArrayResponse, IsubscriptionFeature } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../../stock-auth-client';

export class CompanySubscription {
  subscriprionId: string;
  startDate: Date;
  endDate: Date;
  features: IsubscriptionFeature[];

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
    const observer$ = StockAuthClient.ehttp
      .makeGet(`/companysubscription/getall/${offset}/${limit}/${companyId}`);
    const companysubscriptions = await lastValueFrom(observer$) as IdataArrayResponse;
    return {
      count: companysubscriptions.count,
      companysubscriptions: companysubscriptions.data
        .map((val) => new CompanySubscription(val)) };
  }
  static async subscribe(
    companyId: string,
    companySubscription
  ) {
    const observer$ = StockAuthClient.ehttp
      .makePost(`/companysubscription/subscribe/${companyId}`, companySubscription);
    return lastValueFrom(observer$) ;
  }

  static async deleteCompanySubscription(
    companyId: string,
    id: string
  ) {
    const observer$ = StockAuthClient.ehttp
      .makePut(`/companysubscription/deleteone/${companyId}`, { id });
    return lastValueFrom(observer$) ;
  }
}
