/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
/** model type for itemDecoy by */
/** */
export interface IitemDecoy extends Document {
    urId: string;
    type: string;
    items: string[];
}
/** main connection for itemDecoys Operations*/
export declare let itemDecoyMain: Model<IitemDecoy>;
/** lean connection for itemDecoys Operations*/
export declare let itemDecoyLean: Model<IitemDecoy>;
/** primary selection object
 * for itemDecoy
 */
/** */
export declare const itemDecoySelect: {
    urId: number;
    type: number;
    items: number;
};
/** */
/**
 * Creates an ItemDecoy model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export declare const createItemDecoyModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
