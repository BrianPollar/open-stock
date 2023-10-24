/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Ifaq } from '@open-stock/stock-universal';
/** model type for faq by*/
/** */
export type Tfaq = Document & Ifaq;
/** main connection for faqs Operations*/
export declare let faqMain: Model<Tfaq>;
/** lean connection for faqs Operations*/
export declare let faqLean: Model<Tfaq>;
/** primary selection object
 * for faq
 */
/** */
export declare const faqSelect: {
    urId: number;
    posterName: number;
    posterEmail: number;
    userId: number;
    qn: number;
};
/** */
export declare const createFaqModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
