import { DatabaseAuto, IsubscriptionFeature, IsubscriptionPackage, Isuccess, TsubscriptionDurVal } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../../stock-auth-client';

export class SubscriptionPackange
  extends DatabaseAuto {
  name: string;
  ammount: number;
  duration: TsubscriptionDurVal;
  active: boolean;
  features: IsubscriptionFeature[];

  constructor(data) {
    super(data);
    this.name = data.name;
    this.ammount = data.ammount;
    this.duration = data.duration;
    this.active = data.active;
    this.features = data.features;
  }

  static async getSubscriptionPackanges() {
    const observer$ = StockAuthClient.ehttp
      .makeGet('/subscriptionpackage/getall');
    const companysubscriptions = await lastValueFrom(observer$) as IsubscriptionPackage[];
    return companysubscriptions
      .map((val) => new SubscriptionPackange(val));
  }

  static async addSubscriptionPackage(
    subscriptionPackage: IsubscriptionPackage
  ) {
    const observer$ = StockAuthClient.ehttp
      .makePost('/subscriptionpackage/create', subscriptionPackage);
    return lastValueFrom(observer$) as Promise<Isuccess>;
  }

  static async deleteSubscriptionPackange(
    id: string
  ) {
    const observer$ = StockAuthClient.ehttp
      .makePut(`/subscriptionpackage/deleteone/${id}`, {});
    return lastValueFrom(observer$) as Promise<Isuccess>;
  }

  async updateSubscriptionPackage(subscriptionPackange: IsubscriptionPackage) {
    const observer$ = StockAuthClient.ehttp
      .makePut('/subscriptionpackage/updateone', subscriptionPackange);
    return lastValueFrom(observer$) as Promise<Isuccess>;
  }
}
