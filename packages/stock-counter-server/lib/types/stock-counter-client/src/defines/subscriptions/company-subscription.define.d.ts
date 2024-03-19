import { Isuccess } from '@open-stock/stock-universal';
export declare class CompanySubscription {
    subscriprionId: string;
    startDate: Date;
    endDate: Date;
    features: [];
    constructor(data: any);
    static getCompanySubscriptions(companyId: string, offset?: number, limit?: number): Promise<CompanySubscription[]>;
    static subscribe(companyId: string, companySubscription: any): Promise<Isuccess>;
    static deleteCompanySubscription(companyId: string, id: string): Promise<Isuccess>;
}
