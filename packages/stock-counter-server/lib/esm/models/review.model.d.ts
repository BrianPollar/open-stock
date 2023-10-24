/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IreviewMain } from '@open-stock/stock-universal';
/** model type for review by*/
/** */
export type Treview = Document & IreviewMain;
/** main connection for reviews Operations*/
export declare let reviewMain: Model<Treview>;
/** lean connection for reviews Operations*/
export declare let reviewLean: Model<Treview>;
/** primary selection object
 * for review
 */
/** */
export declare const reviewSelect: {
    urId: number;
    image: number;
    name: number;
    email: number;
    comment: number;
    rating: number;
    images: number;
    userId: number;
    itemId: number;
};
/** */
export declare const createReviewModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
