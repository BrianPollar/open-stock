import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
export class SubscriptionPackange {
    constructor(data) {
        this.name = data.name;
        this.ammount = data.ammount;
        this.duration = data.duration;
        this.active = data.active;
        this.features = data.features;
    }
    static async getSubscriptionPackanges() {
        const observer$ = StockCounterClient.ehttp
            .makeGet('/subscriptionpackage/getall');
        const companysubscriptions = await lastValueFrom(observer$);
        return companysubscriptions
            .map((val) => new SubscriptionPackange(val));
    }
    static async addSubscriptionPackange(companyId, subscriptionPackages) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/subscriptionpackage/create/${companyId}`, subscriptionPackages);
        return await lastValueFrom(observer$);
    }
    static async deleteSubscriptionPackange(id) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/subscriptionpackage/deleteone/${id}`, {});
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=subscription-package.define.js.map