"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanySubscription = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_auth_client_1 = require("../../stock-auth-client");
class CompanySubscription extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.name = data.name;
        this.ammount = data.ammount;
        this.duration = data.duration;
        this.subscriprionId = data.subscriprionId;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.features = data.features;
    }
    static async getCompanySubscriptions(companyId, offset = 0, limit = 20) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makeGet(`/companysubscription/getall/${offset}/${limit}/${companyId}`);
        const companysubscriptions = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: companysubscriptions.count,
            companysubscriptions: companysubscriptions.data
                .map((val) => new CompanySubscription(val))
        };
    }
    static async subscribe(companyId, subscriptionPackage) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePost(`/companysubscription/subscribe/${companyId}`, subscriptionPackage);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static async deleteCompanySubscription(companyId, id) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp
            .makePut(`/companysubscription/deleteone/${companyId}`, { id });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.CompanySubscription = CompanySubscription;
//# sourceMappingURL=company-subscription.define.js.map