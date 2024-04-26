import { DatabaseAuto, IsubscriptionFeature, IsubscriptionPackage, Isuccess } from '@open-stock/stock-universal';
import { TsubscriptionDurVal } from '@open-stock/stock-universal';
export declare class CompanySubscription extends DatabaseAuto {
    name: string;
    ammount: number;
    duration: TsubscriptionDurVal;
    subscriprionId: string;
    startDate: Date;
    endDate: Date;
    features: IsubscriptionFeature[];
    constructor(data: any);
    static getCompanySubscriptions(companyId: string, offset?: number, limit?: number): Promise<{
        count: number;
        companysubscriptions: CompanySubscription[];
    }>;
    static subscribe(companyId: string, subscriptionPackage: Partial<IsubscriptionPackage>): Promise<Isuccess & {
        data: any;
    }>;
    static deleteCompanySubscription(companyId: string, id: string): Promise<Isuccess>;
}
