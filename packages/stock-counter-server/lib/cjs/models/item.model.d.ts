/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
/** model type for item by*/
/** */
export type TitemModel = Document & any;
/** main connection for items Operations*/
export declare let itemMain: Model<any>;
/** lean connection for items Operations*/
export declare let itemLean: Model<any>;
/** primary selection object
 * for item
 */
/** */
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
/** */
export declare const createItemModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
