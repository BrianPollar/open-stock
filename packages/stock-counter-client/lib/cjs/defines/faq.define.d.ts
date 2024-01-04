import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, Ifaq, Ifaqanswer, Isuccess } from '@open-stock/stock-universal';
/** The  Faq  class represents a FAQ object. It extends the  DatabaseAuto  class and includes properties such as  urId ,  posterName ,  posterEmail ,  userId ,  qn ,  ans , and  approved . It also includes methods for retrieving FAQs, creating a new FAQ, deleting FAQs, changing the approval status of a FAQ, and deleting a FAQ. */
/**
 * Represents a frequently asked question (FAQ) in the system.
 */
export declare class Faq extends DatabaseAuto {
    /** The unique identifier of the user who created the FAQ. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The name of the user who created the FAQ. */
    posterName: string;
    /** The email of the user who created the FAQ. */
    posterEmail: string;
    /** The unique identifier or the user object of the user who created the FAQ. */
    userId: string | User;
    /** The question of the FAQ. */
    qn: string;
    /** The answers to the FAQ. */
    ans?: FaqAnswer[];
    /** Indicates whether the FAQ is approved or not. */
    approved: boolean;
    /**
     * Creates a new instance of the Faq class.
     * @param data The data to initialize the instance with.
     */
    constructor(data: Ifaq);
    /**
     * Retrieves all FAQs from the server.
     * @param companyId - The ID of the company
     * @param url The URL to retrieve the FAQs from.
     * @param offset The offset to start retrieving FAQs from.
     * @param limit The maximum number of FAQs to retrieve.
     * @returns An array of Faq instances.
     */
    static getFaqs(companyId: string, url?: string, offset?: number, limit?: number): Promise<Faq[]>;
    /**
     * Retrieves a single FAQ from the server.
     * @param companyId - The ID of the company
     * @param id The unique identifier of the FAQ to retrieve.
     * @returns A Faq instance.
     */
    static getOnefaq(companyId: string, id: string): Promise<Faq>;
    /**
     * Creates a new FAQ on the server.
     * @param companyId - The ID of the company
     * @param faq The FAQ to create.
     * @returns An object indicating whether the operation was successful or not.
     */
    static createfaq(companyId: string, faq: Ifaq): Promise<Isuccess>;
    /**
     * Deletes multiple FAQs from the server.
     * @param companyId - The ID of the company
     * @param ids The unique identifiers of the FAQs to delete.
     * @returns An object indicating whether the operation was successful or not.
     */
    static deleteFaqs(companyId: string, ids: string[]): Promise<Isuccess>;
    /**
     * Changes the approval status of the FAQ on the server.
     * @param companyId - The ID of the company
     * @param approved The new approval status of the FAQ.
     * @returns An object indicating whether the operation was successful or not.
     */
    changeApproved(companyId: string, approved: boolean): Promise<Isuccess>;
    /**
     * Deletes the FAQ from the server.
     * @param companyId - The ID of the company
     * @returns An object indicating whether the operation was successful or not.
     */
    deleteFaq(companyId: string): Promise<Isuccess>;
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
    static getFaqAns(companyId: string, faq: string): Promise<FaqAnswer[]>;
    /**
     * Retrieves a single FAQ answer by its ID.
     * @param companyId - The ID of the company.
     * @param id - The ID of the FAQ answer.
     * @returns A Promise that resolves to a new instance of FaqAnswer.
     */
    static getOnefaqAns(companyId: string, id: string): Promise<FaqAnswer>;
    /**
     * Creates a FAQ answer for a specific company.
     * @param companyId The ID of the company.
     * @param faq The FAQ answer to be created.
     * @returns A promise that resolves to the added FAQ answer.
     */
    static createfaqAns(companyId: string, faq: Ifaqanswer): Promise<Isuccess>;
    /**
     * Deletes a FAQ answer for a specific company.
     * @param companyId - The ID of the company.
     * @returns A promise that resolves to an Isuccess object.
     */
    deleteFaqAns(companyId: string): Promise<Isuccess>;
}
