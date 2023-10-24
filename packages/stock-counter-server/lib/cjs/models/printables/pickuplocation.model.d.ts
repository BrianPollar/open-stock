/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
import { IpickupLocation } from '@open-stock/stock-universal';
/** model type for pickupLocation by */
/** */
export type TpickupLocation = Document & IpickupLocation;
/** main connection for pickupLocations Operations*/
export declare let pickupLocationMain: Model<TpickupLocation>;
/** lean connection for pickupLocations Operations*/
export declare let pickupLocationLean: Model<TpickupLocation>;
/** primary selection object
 * for pickupLocation
 */
/** */
export declare const pickupLocationSelect: {
    name: number;
    contact: number;
};
/** */
export declare const createPickupLocationModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
