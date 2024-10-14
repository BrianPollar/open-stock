/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
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
import { Ideliverycity } from '@open-stock/stock-universal';
import { IcompanyIdAsObjectId } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a delivery city.
 * @typedef {Document & Ideliverycity} Tdeliverycity
 */
export type Tdeliverycity = Document & Ideliverycity & IcompanyIdAsObjectId;
/**
 * Represents the main delivery city model.
 */
export declare let deliverycityMain: Model<Tdeliverycity>;
/**
 * Represents a variable that holds a lean model of the delivery city.
 */
export declare let deliverycityLean: Model<Tdeliverycity>;
/**
 * Represents the selection of delivery cities.
 */
export declare const deliverycitySelect: {
    name: number;
    shippingCost: number;
    currency: number;
    deliversInDays: number;
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
/**
 * Creates a delivery city model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create a main connection or not.
 * @param lean Whether to create a lean connection or not.
 */
export declare const createDeliverycityModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
