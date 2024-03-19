/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Iitem } from '@open-stock/stock-universal';
import { Document, Model } from 'mongoose';
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
};
/**
 * Creates the item model and connects to the database.
 * @param dbUrl - The URL of the database to connect to
 * @param main - Whether to create the main connection for item operations (default: true)
 * @param lean - Whether to create the lean connection for item operations (default: true)
 */
export declare const createItemModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
