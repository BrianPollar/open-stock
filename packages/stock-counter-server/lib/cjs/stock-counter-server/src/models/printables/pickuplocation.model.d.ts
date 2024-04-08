/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
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
