import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
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
  
     * @param url The URL to retrieve the FAQs from.
     * @param offset The offset to start retrieving FAQs from.
     * @param limit The maximum number of FAQs to retrieve.
     * @returns An array of Faq instances.
     */
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
    /**
     * Retrieves a single FAQ from the server.
  
     * @param _id The unique identifier of the FAQ to retrieve.
     * @returns A Faq instance.
     */
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/faq/one/${_id}`);
        const faq = await lastValueFrom(observer$);
        return new Faq(faq);
    }
    /**
     * Creates a new FAQ on the server.
  
     * @param faq The FAQ to create.
     * @returns An object indicating whether the operation was successful or not.
     */
    static add(faq) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/faq/add', faq);
        return lastValueFrom(observer$);
    }
    /**
     * Deletes multiple FAQs from the server.
  
     * @param _ids The unique identifiers of the FAQs to delete.
     * @returns An object indicating whether the operation was successful or not.
     */
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/faq/delete/many', vals);
        return lastValueFrom(observer$);
    }
    /**
     * Changes the approval status of the FAQ on the server.
  
     * @param approved The new approval status of the FAQ.
     * @returns An object indicating whether the operation was successful or not.
     */
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
    /**
     * Deletes the FAQ from the server.
  
     * @returns An object indicating whether the operation was successful or not.
     */
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/faq/delete/one/${this._id}`);
        return lastValueFrom(observer$);
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
    static async getAll(faq) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/faq/getallans/${faq}`);
        const faqans = await lastValueFrom(observer$);
        return {
            count: faqans.count,
            faqans: faqans.data.map(val => new FaqAnswer(val))
        };
    }
    /**
     * Retrieves a single FAQ answer by its ID.
     .
     * @param _id - The ID of the FAQ answer.
     * @returns A Promise that resolves to a new instance of FaqAnswer.
     */
    static async getOne(_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/faq/one/${_id}`);
        const faqans = await lastValueFrom(observer$);
        return new FaqAnswer(faqans);
    }
    /**
     * Creates a FAQ answer for a specific company.
     * @param companyId The ID of the company.
     * @param faq The FAQ answer to be created.
     * @returns A promise that resolves to the added FAQ answer.
     */
    static async add(faq) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/faq/createans', {
            faq
        });
        const added = await lastValueFrom(observer$);
        return added;
    }
    /**
     * Deletes a FAQ answer for a specific company.
     .
     * @returns A promise that resolves to an Isuccess object.
     */
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/faq/deleteoneans/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=faq.define.js.map