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
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents an item with limited quantity.
 */
export interface IitemLimitted extends Document {
    /** The unique identifier of the user. */
    urId: string;
    /** The user's company ID. */
    companyId: string;
    /** The name of the item. */
    name: string;
}
/**
 * Represents the main itemLimitted model.
 */
export declare let itemLimittedMain: Model<IitemLimitted>;
/**
 * Represents a variable that holds a lean model of an item with limited properties.
 */
export declare let itemLimittedLean: Model<IitemLimitted>;
/**
 * Represents the itemLimittedSelect function.
 */
export declare const itemLimittedSelect: {
    urId: number;
    companyId: number;
    name: number;
};
/**
 * Creates an ItemLimitted model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the model for the main connection.
 * @param lean Whether to create the model for the lean connection.
 */
export declare const createItemLimittedModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
