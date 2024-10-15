import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../../stock-auth-client';
export class CompanySubscription extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.name = data.name;
        this.amount = data.amount;
        this.duration = data.duration;
        this.subscriprionId = data.subscriprionId;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.features = data.features;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockAuthClient.ehttp
            .makeGet(`/companysubscription/all/${offset}/${limit}`);
        const companysubscriptions = await lastValueFrom(observer$);
        return {
            count: companysubscriptions.count,
            companysubscriptions: companysubscriptions.data
                .map((val) => new CompanySubscription(val))
        };
    }
    static async filterAll(filterProps) {
        const observer$ = StockAuthClient.ehttp
            .makePost('/companysubscription/filter', filterProps);
        const companysubscriptions = await lastValueFrom(observer$);
        return {
            count: companysubscriptions.count,
            companysubscriptions: companysubscriptions.data
                .map((val) => new CompanySubscription(val))
        };
    }
    static subscribe(subscriptionPackage) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const observer$ = StockAuthClient.ehttp.makePost('/companysubscription/subscribe', subscriptionPackage);
        return lastValueFrom(observer$);
    }
    static removeOne(val) {
        const observer$ = StockAuthClient.ehttp.makePut('/companysubscription/delete/one', val);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=company-subscription.define.js.map