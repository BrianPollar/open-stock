import {
  DatabaseAuto, IcompanySubscription,
  IdataArrayResponse, IdeleteOne, IsubscriptionFeature,
  IsubscriptionPackage, Isuccess, TsubscriptionDurVal
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../../stock-auth-client';

export class CompanySubscription
  extends DatabaseAuto {
  name: string;
  ammount: number;
  duration: TsubscriptionDurVal;
  subscriprionId: string;
  startDate: Date;
  endDate: Date;
  features: IsubscriptionFeature[];

  constructor(data: IcompanySubscription) {
    super(data);
    this.name = data.name;
    this.ammount = data.ammount;
    this.duration = data.duration;
    this.subscriprionId = data.subscriprionId;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.features = data.features;
  }

  static async getAll(
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockAuthClient.ehttp
      .makeGet<IdataArrayResponse<IcompanySubscription>>(`/companysubscription/all/${offset}/${limit}`);
    const companysubscriptions = await lastValueFrom(observer$);

    return {
      count: companysubscriptions.count,
      companysubscriptions: companysubscriptions.data
        .map((val) => new CompanySubscription(val)) };
  }

  static subscribe(subscriptionPackage: Partial<IsubscriptionPackage>) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const observer$ = StockAuthClient.ehttp.makePost<Isuccess & { data: { pesaPalOrderRes: { redirect_url: string}} }>(
      '/companysubscription/subscribe',
      subscriptionPackage
    );

    return lastValueFrom(observer$);
  }

  static removeOne(val: IdeleteOne) {
    const observer$ = StockAuthClient.ehttp.makePut<Isuccess>(
      '/companysubscription/delete/one',
      val
    );

    return lastValueFrom(observer$);
  }
}
