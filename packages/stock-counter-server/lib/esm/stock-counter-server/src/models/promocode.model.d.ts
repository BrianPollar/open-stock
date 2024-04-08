/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a promotional code.
 */
export interface Ipromocode extends Document {
    /** The unique identifier of the user. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The code of the promotional code. */
    code: string;
    /** The amount associated with the promotional code. */
    amount: number;
    /** The items associated with the promotional code. */
    items: string[];
    /** The room ID associated with the promotional code. */
    roomId: string;
    /** The state of the promotional code. */
    state: string;
    /** The expiration date of the promotional code. */
    expireAt: string;
}
/**
 * The main promocode model.
 */
export declare let promocodeMain: Model<Ipromocode>;
/**
 * Represents a lean version of the promocode model.
 */
export declare let promocodeLean: Model<Ipromocode>;
/**
 * Selects the promocode from the database.
 * @param promocodeselect - The promocode select query.
 * @returns The selected promocode.
 */
export declare const promocodeSelect: {
    urId: number;
    companyId: number;
    code: number;
    amount: number;
    items: number;
    roomId: number;
    used: number;
};
/**
 * Creates a promocode model with the specified database URL.
 * @param dbUrl The URL of the database.
 * @param main Optional parameter indicating whether to create the main promocode model. Default is true.
 * @param lean Optional parameter indicating whether to create the lean promocode model. Default is true.
 */
export declare const createPromocodeModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
