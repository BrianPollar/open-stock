/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Ifaq } from '@open-stock/stock-universal';
/** Model type for FAQ */
export type Tfaq = Document & Ifaq;
/** Main connection for FAQ operations */
export declare let faqMain: Model<Tfaq>;
/** Lean connection for FAQ operations */
export declare let faqLean: Model<Tfaq>;
/** Primary selection object for FAQ */
export declare const faqSelect: {
    urId: number;
    posterName: number;
    posterEmail: number;
    userId: number;
    qn: number;
};
/**
 * Creates a new FAQ model.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export declare const createFaqModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
