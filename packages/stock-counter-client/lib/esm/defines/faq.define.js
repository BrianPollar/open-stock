import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
/** The  Faq  class represents a FAQ object. It extends the  DatabaseAuto  class and includes properties such as  urId ,  posterName ,  posterEmail ,  userId ,  qn ,  ans , and  approved . It also includes methods for retrieving FAQs, creating a new FAQ, deleting FAQs, changing the approval status of a FAQ, and deleting a FAQ. */
/**
 * Represents a frequently asked question (FAQ) in the system.
 */
export class Faq extends DatabaseAuto {
    /**
     * Creates a new instance of the Faq class.
     * @param data The data to initialize the instance with.
     */
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
    /**
     * Retrieves all FAQs from the server.
     * @param companyId - The ID of the company
     * @param url The URL to retrieve the FAQs from.
     * @param offset The offset to start retrieving FAQs from.
     * @param limit The maximum number of FAQs to retrieve.
     * @returns An array of Faq instances.
     */
    static async getFaqs(companyId, url = 'getall', offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/faq/${url}/${offset}/${limit}/${companyId}`);
        const faqs = await lastValueFrom(observer$);
        return faqs.map(val => new Faq(val));
    }
    /**
     * Retrieves a single FAQ from the server.
     * @param companyId - The ID of the company
     * @param id The unique identifier of the FAQ to retrieve.
     * @returns A Faq instance.
     */
    static async getOnefaq(companyId, id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/faq/getone/${id}`);
        const faq = await lastValueFrom(observer$);
        return new Faq(faq);
    }
    /**
     * Creates a new FAQ on the server.
     * @param companyId - The ID of the company
     * @param faq The FAQ to create.
     * @returns An object indicating whether the operation was successful or not.
     */
    static async createfaq(companyId, faq) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/faq/create/${companyId}`, {
            faq
        });
        return await lastValueFrom(observer$);
    }
    /**
     * Deletes multiple FAQs from the server.
     * @param companyId - The ID of the company
     * @param ids The unique identifiers of the FAQs to delete.
     * @returns An object indicating whether the operation was successful or not.
     */
    static async deleteFaqs(companyId, ids) {
        const observer$ = StockCounterClient.ehttp
            .makePut(`/faq/deletemany/${companyId}`, { ids });
        return await lastValueFrom(observer$);
    }
    /**
     * Changes the approval status of the FAQ on the server.
     * @param companyId - The ID of the company
     * @param approved The new approval status of the FAQ.
     * @returns An object indicating whether the operation was successful or not.
     */
    async changeApproved(companyId, approved) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/faq/changeapproved/${this._id}/${companyId}`, {
            approved
        });
        const added = await lastValueFrom(observer$);
        if (added.success) {
            this.approved = approved;
        }
        return added;
    }
    /**
     * Deletes the FAQ from the server.
     * @param companyId - The ID of the company
     * @returns An object indicating whether the operation was successful or not.
     */
    async deleteFaq(companyId) {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/faq/deleteone/${this._id}/${companyId}`);
        return await lastValueFrom(observer$);
    }
}
export class FaqAnswer extends DatabaseAuto {
    /**
     * Constructs a new instance of the FaqDefine class.
     * @param data The data object containing the properties for the FaqDefine instance.
     */
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
    /**
     * Retrieves the FAQ answers for a specific company and FAQ.
     * @param companyId The ID of the company.
     * @param faq The FAQ identifier.
     * @returns An array of FAQ answers.
     */
    static async getFaqAns(companyId, faq) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/faq/getallans/${faq}/${companyId}`);
        const faqans = await lastValueFrom(observer$);
        return faqans.map(val => new FaqAnswer(val));
    }
    /**
     * Retrieves a single FAQ answer by its ID.
     * @param companyId - The ID of the company.
     * @param id - The ID of the FAQ answer.
     * @returns A Promise that resolves to a new instance of FaqAnswer.
     */
    static async getOnefaqAns(companyId, id) {
        const observer$ = StockCounterClient.ehttp.makeGet(`/faq/getone/${id}/${companyId}`);
        const faqans = await lastValueFrom(observer$);
        return new FaqAnswer(faqans);
    }
    /**
     * Creates a FAQ answer for a specific company.
     * @param companyId The ID of the company.
     * @param faq The FAQ answer to be created.
     * @returns A promise that resolves to the added FAQ answer.
     */
    static async createfaqAns(companyId, faq) {
        const observer$ = StockCounterClient.ehttp
            .makePost(`/faq/createans/${companyId}`, {
            faq
        });
        const added = await lastValueFrom(observer$);
        return added;
    }
    /**
     * Deletes a FAQ answer for a specific company.
     * @param companyId - The ID of the company.
     * @returns A promise that resolves to an Isuccess object.
     */
    async deleteFaqAns(companyId) {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/faq/deleteoneans/${this._id}/${companyId}`);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=faq.define.js.map