/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
/** Type representing an item document in the database */
export type TitemModel = Document & any;
/** Main connection for item operations */
export declare let itemMain: Model<any>;
/** Lean connection for item operations */
export declare let itemLean: Model<any>;
/** Primary selection object for item */
export declare const itemSelect: {
    urId: number;
    numbersInstock: number;
    name: number;
    purchase: number;
    type: number;
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
    cpuModel: number;
    ramModel: number;
    graphics: number;
    pheripheral: number;
    screen: number;
    storageDrives: number;
    os: number;
    keyBoard: number;
    withScreen: number;
    inventoryMeta: number;
};
/**
 * Creates the item model and connects to the database.
 * @param dbUrl - The URL of the database to connect to
 * @param main - Whether to create the main connection for item operations (default: true)
 * @param lean - Whether to create the lean connection for item operations (default: true)
 */
export declare const createItemModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
