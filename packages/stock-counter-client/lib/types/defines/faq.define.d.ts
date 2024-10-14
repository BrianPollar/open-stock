import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, IdeleteMany, Ifaq, Ifaqanswer, IfilterProps, Isuccess } from '@open-stock/stock-universal';
export declare class Faq extends DatabaseAuto {
    urId: string;
    companyId?: string;
    posterName: string;
    posterEmail: string;
    userId: string | User;
    qn: string;
    ans?: FaqAnswer[];
    approved: boolean;
    constructor(data: Ifaq);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        faqs: Faq[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        faqs: Faq[];
    }>;
    static getOne(id: string): Promise<Faq>;
    static add(faq: Ifaq): Promise<Isuccess>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    changeApproved(approved: boolean): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
export declare class FaqAnswer extends DatabaseAuto {
    urId: string;
    companyId?: string;
    faq: string;
    userId: User | string;
    ans: string;
    constructor(data: Ifaqanswer);
    static getAll(faq: string): Promise<{
        count: number;
        faqans: FaqAnswer[];
    }>;
    static getOne(urIdOr_id: string): Promise<FaqAnswer>;
    static add(faq: Ifaqanswer): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
