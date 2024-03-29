import { Isuccess } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';

export class SubscriptionPackange {
  name: string;
  ammount: number;
  duration: number;
  active: boolean;
  features: [];

  constructor(data) {
    this.name = data.name;
    this.ammount = data.ammount;
    this.duration = data.duration;
    this.active = data.active;
    this.features = data.features;
  }

  static async getSubscriptionPackanges() {
    const observer$ = StockCounterClient.ehttp
      .makeGet('/subscriptionpackage/getall');
    const companysubscriptions = await lastValueFrom(observer$) as unknown[];
    return companysubscriptions
      .map((val) => new SubscriptionPackange(val));
  }

  static async addSubscriptionPackange(
    companyId: string,
    subscriptionPackages
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/subscriptionpackage/create/${companyId}`, subscriptionPackages);
    return await lastValueFrom(observer$) as Isuccess;
  }

  static async deleteSubscriptionPackange(
    id: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/subscriptionpackage/deleteone/${id}`, {});
    return await lastValueFrom(observer$) as Isuccess;
  }
}
