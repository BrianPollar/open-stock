"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPackange = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_auth_client_1 = require("../../stock-auth-client");
class SubscriptionPackange extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.name = data.name;
        this.ammount = data.ammount;
        this.duration = data.duration;
        this.active = data.active;
        this.features = data.features;
    }
    static async getSubscriptionPackanges() {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makeGet('/subscriptionpackage/getall');
        const companysubscriptions = await (0, rxjs_1.lastValueFrom)(observer$);
        return companysubscriptions
            .map((val) => new SubscriptionPackange(val));
    }
    static async addSubscriptionPackage(subscriptionPackage) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost('/subscriptionpackage/create', subscriptionPackage);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static async deleteSubscriptionPackange(id) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePut(`/subscriptionpackage/deleteone/${id}`, {});
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    async updateSubscriptionPackage(subscriptionPackange) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePut('/subscriptionpackage/updateone', subscriptionPackange);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.SubscriptionPackange = SubscriptionPackange;
//# sourceMappingURL=subscription-package.define.js.map