/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { Ifaq } from '@open-stock/stock-universal';
/**
 * Represents a FAQ document in the database.
 */
export type Tfaq = Document & Ifaq;
/**
 * Represents the main FAQ model.
 */
export declare let faqMain: Model<Tfaq>;
/**
 * Represents a lean FAQ model.
 */
export declare let faqLean: Model<Tfaq>;
/**
 * Selects the faqselect constant from the faq.model module.
 */
export declare const faqSelect: {
    urId: number;
    companyId: number;
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
