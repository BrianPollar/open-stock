/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents an item offer.
 */
export interface IitemOffer extends Document {
    /** The user's ID. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The list of items in the offer. */
    items: string[];
    /** The expiration date of the offer. */
    expireAt: Date;
    /** The type of the offer. */
    type: string;
    /** The header of the offer. */
    header: string;
    /** The subheader of the offer. */
    subHeader: string;
    /** The amount of the offer. */
    ammount: number;
}
/**
 * Represents the main item offer model.
 */
export declare let itemOfferMain: Model<IitemOffer>;
/**
 * Represents a lean item offer model.
 */
export declare let itemOfferLean: Model<IitemOffer>;
/**
 * Represents the item offer select function.
 */
export declare const itemOfferSelect: {
    urId: number;
    companyId: number;
    items: number;
    expireAt: number;
    type: number;
    header: number;
    subHeader: number;
    ammount: number;
};
/**
 * Creates an instance of the ItemOffer model with the specified database URL.
 * @param {string} dbUrl - The URL of the database to connect to.
 * @param {boolean} [main=true] - Whether to create the main connection model.
 * @param {boolean} [lean=true] - Whether to create the lean connection model.
 * @returns {Promise<void>} - A promise that resolves when the models have been created.
 */
export declare const createItemOfferModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
