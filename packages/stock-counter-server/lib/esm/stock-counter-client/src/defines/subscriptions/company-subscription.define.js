import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
export class CompanySubscription {
    constructor(data) {
        this.subscriprionId = data.subscriprionId;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.features = data.features;
    }
    static async getCompanySubscriptions(companyId, offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/companysubscription/getall/${offset}/${limit}/${companyId}`);
        const companysubscriptions = await lastValueFrom(observer$);
        return companysubscriptions
            .map((val) => new CompanySubscription(val));
    }
    static async subscribe(companyId, companySubscription) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/companysubscription/subscribe/${companyId}`, companySubscription);
        return await lastValueFrom(observer$);
    }
    static async deleteCompanySubscription(companyId, id) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/companysubscription/deleteone/${companyId}`, { id });
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=company-subscription.define.js.map