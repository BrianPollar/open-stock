import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../../stock-auth-client';
export class CompanySubscription extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.subscriprionId = data.subscriprionId;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.features = data.features;
    }
    static async getCompanySubscriptions(companyId, offset = 0, limit = 20) {
        const observer$ = StockAuthClient.ehttp
            .makeGet(`/companysubscription/getall/${offset}/${limit}/${companyId}`);
        const companysubscriptions = await lastValueFrom(observer$);
        return {
            count: companysubscriptions.count,
            companysubscriptions: companysubscriptions.data
                .map((val) => new CompanySubscription(val))
        };
    }
    static async subscribe(companyId, companySubscription) {
        const observer$ = StockAuthClient.ehttp
            .makePost(`/companysubscription/subscribe/${companyId}`, companySubscription);
        return lastValueFrom(observer$);
    }
    static async deleteCompanySubscription(companyId, id) {
        const observer$ = StockAuthClient.ehttp
            .makePut(`/companysubscription/deleteone/${companyId}`, { id });
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=company-subscription.define.js.map