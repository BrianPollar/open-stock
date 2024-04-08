/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { ConnectOptions, Document, Model } from 'mongoose';
/** model type for itemDecoy by */
/**
 * Represents an item decoy in the system.
 */
export interface IitemDecoy extends Document {
    /**
     * The unique identifier of the user.
     */
    urId: string;
    /**
     * The user's company ID.
     */
    companyId: string;
    /**
     * The type of the item decoy.
     */
    type: string;
    /**
     * The list of items associated with the decoy.
     */
    items: string[];
}
/**
 * Represents the main item decoy model.
 */
export declare let itemDecoyMain: Model<IitemDecoy>;
/**
 * Represents the itemDecoyLean model.
 */
export declare let itemDecoyLean: Model<IitemDecoy>;
/**
 * Selects the item decoy.
 */
export declare const itemDecoySelect: {
    urId: number;
    companyId: number;
    type: number;
    items: number;
};
/**
 * Creates an ItemDecoy model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export declare const createItemDecoyModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
