/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
/** model type for itemLimitted by */
/** */
export interface IitemLimitted extends Document {
    urId: string;
    name: string;
}
/** main connection for itemLimitteds Operations*/
export declare let itemLimittedMain: Model<IitemLimitted>;
/** lean connection for itemLimitteds Operations*/
export declare let itemLimittedLean: Model<IitemLimitted>;
/** primary selection object
 * for itemLimitted
 */
/** */
export declare const itemLimittedSelect: {
    urId: number;
    name: number;
};
/** */
/**
 * Creates an ItemLimitted model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export declare const createItemLimittedModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
