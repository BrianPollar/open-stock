import { IsubscriptionFeature, Isuccess } from '@open-stock/stock-universal';
export declare class CompanySubscription {
    subscriprionId: string;
    startDate: Date;
    endDate: Date;
    features: IsubscriptionFeature[];
    constructor(data: any);
    static getCompanySubscriptions(companyId: string, offset?: number, limit?: number): Promise<{
        count: number;
        companysubscriptions: CompanySubscription[];
    }>;
    static subscribe(companyId: string, companySubscription: any): Promise<Isuccess>;
    static deleteCompanySubscription(companyId: string, id: string): Promise<Isuccess>;
}
