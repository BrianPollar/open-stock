import { DatabaseAuto, IsubscriptionFeature, IsubscriptionPackage, Isuccess, TsubscriptionDurVal } from '@open-stock/stock-universal';
export declare class CompanySubscription extends DatabaseAuto {
    name: string;
    ammount: number;
    duration: TsubscriptionDurVal;
    subscriprionId: string;
    startDate: Date;
    endDate: Date;
    features: IsubscriptionFeature[];
    constructor(data: any);
    /**
     * Retrieves a list of company subscriptions for the specified company.
     *
     * @param companyId - The ID of the company to retrieve subscriptions for.
     * @param offset - The starting index of the subscriptions to retrieve (default is 0).
     * @param limit - The maximum number of subscriptions to retrieve (default is 20).
     * @returns An object containing the total count of subscriptions and the list of subscriptions.
     */
    static getCompanySubscriptions(companyId: string, offset?: number, limit?: number): Promise<{
        count: number;
        companysubscriptions: CompanySubscription[];
    }>;
    /**
     * Subscribes a company to a subscription package.
     *
     * @param companyId - The ID of the company to subscribe.
     * @param subscriptionPackage - The subscription package to subscribe the company to.
     * @returns A promise that resolves to an object containing a success flag and the subscribed data.
     */
    static subscribe(companyId: string, subscriptionPackage: Partial<IsubscriptionPackage>): Promise<Isuccess & {
        data: any;
    }>;
    /**
     * Deletes a company subscription.
     *
     * @param companyId - The ID of the company whose subscription is to be deleted.
     * @param id - The ID of the subscription to be deleted.
     * @returns A promise that resolves to an object containing a success flag.
     */
    static deleteCompanySubscription(companyId: string, id: string): Promise<Isuccess>;
}
