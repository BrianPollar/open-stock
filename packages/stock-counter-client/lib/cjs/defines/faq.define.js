"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqAnswer = exports.Faq = void 0;
const stock_auth_client_1 = require("@open-stock/stock-auth-client");
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
class Faq extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.posterName = data.posterName;
        this.posterEmail = data.posterEmail;
        this.createdAt = data.createdAt;
        this.approved = data.approved;
        if (data.userId._id) {
            this.userId = new stock_auth_client_1.User(data.userId);
        }
        else {
            this.userId = data.userId;
        }
        this.qn = data.qn;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/faq/all/${offset}/${limit}`);
        const faqs = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: faqs.count,
            faqs: faqs.data.map(val => new Faq(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/faq/filter', filter);
        const faqs = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: faqs.count,
            faqs: faqs.data.map(val => new Faq(val))
        };
    }
    static async getOne(id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/faq/one/${id}`);
        const faq = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Faq(faq);
    }
    static add(faq) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/faq/add', faq);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/faq/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    async changeApproved(approved) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost(`/faq/changeapproved/${this._id}`, {
            approved
        });
        const added = await (0, rxjs_1.lastValueFrom)(observer$);
        if (added.success) {
            this.approved = approved;
        }
        return added;
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/faq/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Faq = Faq;
class FaqAnswer extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.faq = data.faq;
        if (data.userId._id) {
            this.userId = new stock_auth_client_1.User(data.userId);
        }
        else {
            this.userId = data.userId;
        }
        this.ans = data.ans;
    }
    static async getAll(faq) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/faq/getallans/${faq}`);
        const faqans = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: faqans.count,
            faqans: faqans.data.map(val => new FaqAnswer(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/faq/one/${urIdOr_id}`);
        const faqans = await (0, rxjs_1.lastValueFrom)(observer$);
        return new FaqAnswer(faqans);
    }
    static async add(faq) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/faq/createans', {
            faq
        });
        const added = await (0, rxjs_1.lastValueFrom)(observer$);
        return added;
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/faq/deleteoneans/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.FaqAnswer = FaqAnswer;
//# sourceMappingURL=faq.define.js.map