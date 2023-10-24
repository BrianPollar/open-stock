/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Ifaqanswer } from '@open-stock/stock-universal';
/** model type for faq ans by*/
/** */
export type Tfaqanswer = Document & Ifaqanswer;
/** main connection for faq ans Operations*/
export declare let faqanswerMain: Model<Tfaqanswer>;
/** lean connection for faq ans Operations*/
export declare let faqanswerLean: Model<Tfaqanswer>;
/** primary selection object
 * for faq ans
 */
/** */
export declare const faqanswerSelect: {
    urId: number;
    faq: number;
    userId: number;
    ans: number;
};
/** */
/**
 * Creates a Faqanswer model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the Faqanswer model for the main connection.
 * @param lean Whether to create the Faqanswer model for the lean connection.
 */
export declare const createFaqanswerModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
