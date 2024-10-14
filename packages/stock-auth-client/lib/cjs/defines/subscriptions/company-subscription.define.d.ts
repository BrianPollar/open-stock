import { DatabaseAuto, IcompanySubscription, IdeleteOne, IfilterProps, IsubscriptionFeature, IsubscriptionPackage, Isuccess, TsubscriptionDurVal } from '@open-stock/stock-universal';
export declare class CompanySubscription extends DatabaseAuto {
    name: string;
    ammount: number;
    duration: TsubscriptionDurVal;
    subscriprionId: string;
    startDate: Date;
    endDate: Date;
    features: IsubscriptionFeature[];
    constructor(data: IcompanySubscription);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        companysubscriptions: CompanySubscription[];
    }>;
    static filterAll(filterProps: IfilterProps): Promise<{
        count: number;
        companysubscriptions: CompanySubscription[];
    }>;
    static subscribe(subscriptionPackage: Partial<IsubscriptionPackage>): Promise<Isuccess & {
        data: {
            pesaPalOrderRes: {
                redirect_url: string;
            };
        };
    }>;
    static removeOne(val: IdeleteOne): Promise<Isuccess>;
}
