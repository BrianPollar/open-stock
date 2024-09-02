import { DatabaseAuto, IdataArrayResponse, IsubscriptionFeature, IsubscriptionPackage, Isuccess, TsubscriptionDurVal } from '@open-stock/stock-universal';
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

  constructor(data) {
    super(data);
    this.name = data.name;
    this.ammount = data.ammount;
    this.duration = data.duration;
    this.subscriprionId = data.subscriprionId;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.features = data.features;
  }

  /**
   * Retrieves a list of company subscriptions for the specified company.
   *
   * @param companyId - The ID of the company to retrieve subscriptions for.
   * @param offset - The starting index of the subscriptions to retrieve (default is 0).
   * @param limit - The maximum number of subscriptions to retrieve (default is 20).
   * @returns An object containing the total count of subscriptions and the list of subscriptions.
   */
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

  /**
   * Subscribes a company to a subscription package.
   *
   * @param companyId - The ID of the company to subscribe.
   * @param subscriptionPackage - The subscription package to subscribe the company to.
   * @returns A promise that resolves to an object containing a success flag and the subscribed data.
   */
  static async subscribe(
    companyId: string,
    subscriptionPackage: Partial<IsubscriptionPackage>
  ) {
    const observer$ = StockAuthClient.ehttp.makePost(
      `/companysubscription/subscribe/${companyId}`,
      subscriptionPackage
    );

    return lastValueFrom(observer$) as Promise<Isuccess & { data }>;
  }

  /**
   * Deletes a company subscription.
   *
   * @param companyId - The ID of the company whose subscription is to be deleted.
   * @param id - The ID of the subscription to be deleted.
   * @returns A promise that resolves to an object containing a success flag.
   */
  static async deleteCompanySubscription(companyId: string, id: string) {
    const observer$ = StockAuthClient.ehttp.makePut(
      `/companysubscription/deleteone/${companyId}`,
      { id }
    );

    return lastValueFrom(observer$) as Promise<Isuccess>;
  }
}
