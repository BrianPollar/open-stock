import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
export class Faq extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.posterName = data.posterName;
        this.posterEmail = data.posterEmail;
        this.createdAt = data.createdAt;
        this.approved = data.approved;
        if (data.userId._id) {
            this.userId = new User(data.userId);
        }
        else {
            this.userId = data.userId;
        }
        this.qn = data.qn;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/faq/all/${offset}/${limit}`);
        const faqs = await lastValueFrom(observer$);
        return {
            count: faqs.count,
            faqs: faqs.data.map(val => new Faq(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/faq/filter', filter);
        const faqs = await lastValueFrom(observer$);
        return {
            count: faqs.count,
            faqs: faqs.data.map(val => new Faq(val))
        };
    }
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/faq/one/${_id}`);
        const faq = await lastValueFrom(observer$);
        return new Faq(faq);
    }
    static add(faq) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/faq/add', faq);
        return lastValueFrom(observer$);
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/faq/delete/many', vals);
        return lastValueFrom(observer$);
    }
    async changeApproved(approved) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/faq/changeapproved/${this._id}`, {
            approved
        });
        const added = await lastValueFrom(observer$);
        if (added.success) {
            this.approved = approved;
        }
        return added;
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/faq/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
export class FaqAnswer extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.faq = data.faq;
        if (data.userId._id) {
            this.userId = new User(data.userId);
        }
        else {
            this.userId = data.userId;
        }
        this.ans = data.ans;
    }
    static async getAll(faq) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/faq/getallans/${faq}`);
        const faqans = await lastValueFrom(observer$);
        return {
            count: faqans.count,
            faqans: faqans.data.map(val => new FaqAnswer(val))
        };
    }
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/faq/one/${_id}`);
        const faqans = await lastValueFrom(observer$);
        return new FaqAnswer(faqans);
    }
    static async add(faq) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/faq/createans', {
            faq
        });
        const added = await lastValueFrom(observer$);
        return added;
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/faq/deleteoneans/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=faq.define.js.map