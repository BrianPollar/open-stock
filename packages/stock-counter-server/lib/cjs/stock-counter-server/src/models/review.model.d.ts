/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { IreviewMain } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
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
export declare const createReviewModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
