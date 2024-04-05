import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../../stock-auth-client';
export class SubscriptionPackange extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.name = data.name;
        this.ammount = data.ammount;
        this.duration = data.duration;
        this.active = data.active;
        this.features = data.features;
    }
    static async getSubscriptionPackanges() {
        const observer$ = StockAuthClient.ehttp
            .makeGet('/subscriptionpackage/getall');
        const companysubscriptions = await lastValueFrom(observer$);
        return companysubscriptions
            .map((val) => new SubscriptionPackange(val));
    }
    static async addSubscriptionPackage(subscriptionPackage) {
        const observer$ = StockAuthClient.ehttp
            .makePost('/subscriptionpackage/create', subscriptionPackage);
        return lastValueFrom(observer$);
    }
    static async deleteSubscriptionPackange(id) {
        const observer$ = StockAuthClient.ehttp
            .makePut(`/subscriptionpackage/deleteone/${id}`, {});
        return lastValueFrom(observer$);
    }
    async updateSubscriptionPackage(subscriptionPackange) {
        const observer$ = StockAuthClient.ehttp
            .makePut('/subscriptionpackage/updateone', subscriptionPackange);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=subscription-package.define.js.map