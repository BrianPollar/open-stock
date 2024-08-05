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
import { ItrackStamp } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a promotional code.
 */
export interface Ipromocode extends Document, ItrackStamp {
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
    trackEdit: number;
    trackView: number;
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
