/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
/** model type for itemOffer by */
/** */
export interface IitemOffer extends Document {
    urId: string;
    items: string[];
    expireAt: Date;
    type: string;
    header: string;
    subHeader: string;
    ammount: number;
}
/** main connection for itemOffers Operations*/
export declare let itemOfferMain: Model<IitemOffer>;
/** lean connection for itemOffers Operations*/
export declare let itemOfferLean: Model<IitemOffer>;
/** primary selection object
 * for itemOffer
 */
/** */
export declare const itemOfferSelect: {
    urId: number;
    items: number;
    expireAt: number;
    type: number;
    header: number;
    subHeader: number;
    ammount: number;
};
/** */
/**
 * Creates an instance of the ItemOffer model with the specified database URL.
 * @param {string} dbUrl - The URL of the database to connect to.
 * @param {boolean} [main=true] - Whether to create the main connection model.
 * @param {boolean} [lean=true] - Whether to create the lean connection model.
 * @returns {Promise<void>} - A promise that resolves when the models have been created.
 */
export declare const createItemOfferModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
