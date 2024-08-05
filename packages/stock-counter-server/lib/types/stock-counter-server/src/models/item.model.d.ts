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
import { Iitem } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents the type of the item model.
 * Extends the Document type and allows any additional properties.
 */
export type TitemModel = Document & Iitem;
/**
 * Represents the main item model.
 */
export declare let itemMain: Model<Iitem>;
/**
 * Represents the lean version of the item model.
 */
export declare let itemLean: Model<Iitem>;
/**
 * Represents the item select function.
 */
export declare const itemSelect: {
    trackEdit: number;
    trackView: number;
    urId: number;
    companyId: number;
    numbersInstock: number;
    name: number;
    purchase: number;
    subCategory: number;
    category: number;
    state: number;
    photos: number;
    colors: number;
    model: number;
    origin: number;
    anyKnownProblems: number;
    createdAt: number;
    updatedAt: number;
    costMeta: number;
    description: number;
    numberBought: number;
    sponsored: number;
    sizing: number;
    buyerGuarantee: number;
    reviewedBy: number;
    reviewCount: number;
    reviewWeight: number;
    reviewRatingsTotal: number;
    likes: number;
    likesCount: number;
    timesViewed: number;
    brand: number;
    inventoryMeta: number;
    ecomerceCompat: number;
    soldCount: number;
};
/**
 * Creates the item model and connects to the database.
 * @param dbUrl - The URL of the database to connect to
 * @param main - Whether to create the main connection for item operations (default: true)
 * @param lean - Whether to create the lean connection for item operations (default: true)
 */
export declare const createItemModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
