import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, Ifaq, Ifaqanswer, Isuccess } from '@open-stock/stock-universal';
/** The  Faq  class represents a FAQ object. It extends the  DatabaseAuto  class and includes properties such as  urId ,  posterName ,  posterEmail ,  userId ,  qn ,  ans , and  approved . It also includes methods for retrieving FAQs, creating a new FAQ, deleting FAQs, changing the approval status of a FAQ, and deleting a FAQ. */
export declare class Faq extends DatabaseAuto {
    /** */
    urId: string;
    /** */
    posterName: string;
    /** */
    posterEmail: string;
    /** */
    userId: string | User;
    /** */
    qn: string;
    /** */
    ans?: FaqAnswer[];
    /** */
    approved: boolean;
    /** */
    constructor(data: Ifaq);
    /** */
    static getFaqs(url?: string, offset?: number, limit?: number): Promise<Faq[]>;
    /** */
    static getOnefaq(id: string): Promise<Faq>;
    /** */
    static createfaq(faq: Ifaq): Promise<Isuccess>;
    /** */
    static deleteFaqs(ids: string[]): Promise<Isuccess>;
    /** */
    changeApproved(approved: boolean): Promise<Isuccess>;
    /** */
    deleteFaq(): Promise<Isuccess>;
}
/** */
export declare class FaqAnswer extends DatabaseAuto {
    /** */
    urId: string;
    /** */
    faq: string;
    /** */
    userId: User | string;
    /** */
    ans: string;
    /** */
    constructor(data: Ifaqanswer);
    /** */
    static getFaqAns(faq: string): Promise<FaqAnswer[]>;
    /** */
    static getOnefaqAns(id: string): Promise<FaqAnswer>;
    /** */
    static createfaqAns(faq: Ifaqanswer): Promise<Isuccess>;
    /** */
    deleteFaqAns(): Promise<Isuccess>;
}
