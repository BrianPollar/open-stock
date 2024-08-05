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
    /**
     * Retrieves a list of company subscriptions for the specified company.
     *
     * @param companyId - The ID of the company to retrieve subscriptions for.
     * @param offset - The starting index of the subscriptions to retrieve (default is 0).
     * @param limit - The maximum number of subscriptions to retrieve (default is 20).
     * @returns An object containing the total count of subscriptions and the list of subscriptions.
     */
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
    /**
     * Subscribes a company to a subscription package.
     *
     * @param companyId - The ID of the company to subscribe.
     * @param subscriptionPackage - The subscription package to subscribe the company to.
     * @returns A promise that resolves to an object containing a success flag and the subscribed data.
     */
    static async subscribe(companyId, subscriptionPackage) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makePost(`/companysubscription/subscribe/${companyId}`, subscriptionPackage);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Deletes a company subscription.
     *
     * @param companyId - The ID of the company whose subscription is to be deleted.
     * @param id - The ID of the subscription to be deleted.
     * @returns A promise that resolves to an object containing a success flag.
     */
    static async deleteCompanySubscription(companyId, id) {
        const observer$ = stock_auth_client_1.StockAuthClient.ehttp.makePut(`/companysubscription/deleteone/${companyId}`, { id });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.CompanySubscription = CompanySubscription;
//# sourceMappingURL=company-subscription.define.js.map