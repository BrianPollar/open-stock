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
import { IpickupLocation } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a pickup location.
 * @typedef {Document & IpickupLocation} TpickupLocation
 */
export type TpickupLocation = Document & IpickupLocation;
/**
 * Represents the main pickup location model.
 */
export declare let pickupLocationMain: Model<TpickupLocation>;
/**
 * Represents a lean pickup location model.
 */
export declare let pickupLocationLean: Model<TpickupLocation>;
/**
 * Represents a pickup location select.
 */
export declare const pickupLocationSelect: {
    companyId: number;
    name: number;
    contact: number;
};
/**
 * Creates a new PickupLocation model with the specified database URL, main connection and lean connection.
 * @param dbUrl The database URL to connect to.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export declare const createPickupLocationModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
