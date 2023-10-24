/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/** The  Faq  class represents a FAQ object. It extends the  DatabaseAuto  class and includes properties such as  urId ,  posterName ,  posterEmail ,  userId ,  qn ,  ans , and  approved . It also includes methods for retrieving FAQs, creating a new FAQ, deleting FAQs, changing the approval status of a FAQ, and deleting a FAQ. */
export class Faq extends DatabaseAuto {
    /** */
    constructor(data) {
        super(data);
        this.urId = data.urId;
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
    /** */
    static async getFaqs(url = 'getall', offset = 0, limit = 0) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/faq/${url}/${offset}/${limit}`);
        const faqs = await lastValueFrom(observer$);
        return faqs.map(val => new Faq(val));
    }
    /** */
    static async getOnefaq(id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/faq/getone/${id}`);
        const faq = await lastValueFrom(observer$);
        return new Faq(faq);
    }
    /** */
    static async createfaq(faq) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/faq/create', {
            faq
        });
        return await lastValueFrom(observer$);
    }
    /** */
    static async deleteFaqs(ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/faq/deletemany', { ids });
        return await lastValueFrom(observer$);
    }
    /** */
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
    /** */
    async deleteFaq() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/faq/deleteone/${this._id}`);
        return await lastValueFrom(observer$);
    }
}
/** */
export class FaqAnswer extends DatabaseAuto {
    /** */
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.faq = data.faq;
        if (data.userId._id) {
            this.userId = new User(data.userId);
        }
        else {
            this.userId = data.userId;
        }
        this.ans = data.ans;
    }
    /** */
    static async getFaqAns(faq) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/faq/getallans/${faq}`);
        const faqans = await lastValueFrom(observer$);
        return faqans.map(val => new FaqAnswer(val));
    }
    /** */
    static async getOnefaqAns(id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/faq/getone/${id}`);
        const faqans = await lastValueFrom(observer$);
        return new FaqAnswer(faqans);
    }
    /** */
    static async createfaqAns(faq) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/faq/createans', {
            faq
        });
        const added = await lastValueFrom(observer$);
        return added;
    }
    /** */
    async deleteFaqAns() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/faq/deleteoneans/${this._id}`);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=faq.define.js.map