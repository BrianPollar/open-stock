/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IreviewMain } from '@open-stock/stock-universal';
/**
 * Represents a review document with additional properties from IreviewMain.
 * @typeparam TDocument - The type of the document.
 * @typeparam TMain - The type of the main review.
 */
export type Treview = Document & IreviewMain;
/**
 * Represents the main review model.
 */
export declare let reviewMain: Model<Treview>;
/** lean connection for reviews Operations*/
/**
 * Represents a lean review model.
 */
export declare let reviewLean: Model<Treview>;
/**
 * Represents the review select function.
 */
export declare const reviewSelect: {
    urId: number;
    companyId: number;
    image: number;
    name: number;
    email: number;
    comment: number;
    rating: number;
    images: number;
    userId: number;
    itemId: number;
};
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
export declare const createReviewModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
