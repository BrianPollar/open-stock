/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Ifaqanswer } from '@open-stock/stock-universal';
/**
 * Represents a FAQ answer document.
 * Extends the Document interface and the Ifaqanswer interface.
 */
export type Tfaqanswer = Document & Ifaqanswer;
/**
 * The main faqanswer model.
 */
export declare let faqanswerMain: Model<Tfaqanswer>;
/**
 * Represents a lean version of the FAQ answer model.
 */
export declare let faqanswerLean: Model<Tfaqanswer>;
/**
 * Selects the faqanswer object.
 */
export declare const faqanswerSelect: {
    urId: number;
    companyId: number;
    faq: number;
    userId: number;
    ans: number;
};
/**
 * Creates a Faqanswer model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the Faqanswer model for the main connection.
 * @param lean Whether to create the Faqanswer model for the lean connection.
 */
export declare const createFaqanswerModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
