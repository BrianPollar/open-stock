"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPackange = void 0;
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
class SubscriptionPackange {
    constructor(data) {
        this.name = data.name;
        this.ammount = data.ammount;
        this.duration = data.duration;
        this.active = data.active;
        this.features = data.features;
    }
    static async getSubscriptionPackanges() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet('/subscriptionpackage/getall');
        const companysubscriptions = await (0, rxjs_1.lastValueFrom)(observer$);
        return companysubscriptions
            .map((val) => new SubscriptionPackange(val));
    }
    static async addSubscriptionPackange(companyId, subscriptionPackages) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost(`/subscriptionpackage/create/${companyId}`, subscriptionPackages);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    static async deleteSubscriptionPackange(id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut(`/subscriptionpackage/deleteone/${id}`, {});
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.SubscriptionPackange = SubscriptionPackange;
//# sourceMappingURL=subscription-package.define.js.map