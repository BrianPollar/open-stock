import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, IdeleteMany, Ifaq, Ifaqanswer, IfilterProps, Isuccess } from '@open-stock/stock-universal';
export declare class Faq extends DatabaseAuto {
    urId: string;
    companyId: string;
    posterName: string;
    posterEmail: string;
    userId: string | User;
    qn: string;
    ans?: FaqAnswer[];
    approved: boolean;
    /**
     * Creates a new instance of the Faq class.
     * @param data The data to initialize the instance with.
     */
    constructor(data: Ifaq);
    /**
     * Retrieves all FAQs from the server.
  
     * @param url The URL to retrieve the FAQs from.
     * @param offset The offset to start retrieving FAQs from.
     * @param limit The maximum number of FAQs to retrieve.
     * @returns An array of Faq instances.
     */
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        faqs: Faq[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        faqs: Faq[];
    }>;
    /**
     * Retrieves a single FAQ from the server.
  
     * @param _id The unique identifier of the FAQ to retrieve.
     * @returns A Faq instance.
     */
    static getOne(_id: string): Promise<Faq>;
    /**
     * Creates a new FAQ on the server.
  
     * @param faq The FAQ to create.
     * @returns An object indicating whether the operation was successful or not.
     */
    static add(faq: Ifaq): Promise<Isuccess>;
    /**
     * Deletes multiple FAQs from the server.
  
     * @param _ids The unique identifiers of the FAQs to delete.
     * @returns An object indicating whether the operation was successful or not.
     */
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    /**
     * Changes the approval status of the FAQ on the server.
  
     * @param approved The new approval status of the FAQ.
     * @returns An object indicating whether the operation was successful or not.
     */
    changeApproved(approved: boolean): Promise<Isuccess>;
    /**
     * Deletes the FAQ from the server.
  
     * @returns An object indicating whether the operation was successful or not.
     */
    remove(): Promise<Isuccess>;
}
export declare class FaqAnswer extends DatabaseAuto {
    urId: string;
    /** The user's company ID. */
    companyId: string;
    faq: string;
    userId: User | string;
    ans: string;
    /**
     * Constructs a new instance of the FaqDefine class.
     * @param data The data object containing the properties for the FaqDefine instance.
     */
    constructor(data: Ifaqanswer);
    /**
     * Retrieves the FAQ answers for a specific company and FAQ.
     * @param companyId The ID of the company.
     * @param faq The FAQ identifier.
     * @returns An array of FAQ answers.
     */
    static getAll(faq: string): Promise<{
        count: number;
        faqans: FaqAnswer[];
    }>;
    /**
     * Retrieves a single FAQ answer by its ID.
     .
     * @param _id - The ID of the FAQ answer.
     * @returns A Promise that resolves to a new instance of FaqAnswer.
     */
    static getOne(_id: string): Promise<FaqAnswer>;
    /**
     * Creates a FAQ answer for a specific company.
     * @param companyId The ID of the company.
     * @param faq The FAQ answer to be created.
     * @returns A promise that resolves to the added FAQ answer.
     */
    static add(faq: Ifaqanswer): Promise<Isuccess>;
    /**
     * Deletes a FAQ answer for a specific company.
     .
     * @returns A promise that resolves to an Isuccess object.
     */
    remove(): Promise<Isuccess>;
}
