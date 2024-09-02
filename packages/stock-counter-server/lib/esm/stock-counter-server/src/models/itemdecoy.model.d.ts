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
import { ItrackStamp } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/** model type for itemDecoy by */
/**
 * Represents an item decoy in the system.
 */
export interface IitemDecoy extends Document, ItrackStamp {
    expireDocAfterTime: Date;
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
    type: number;
    items: number;
    urId: number;
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
/**
 * Creates an ItemDecoy model with the specified database URL, main connection and lean connection.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection or not. Defaults to true.
 * @param lean Whether to create the lean connection or not. Defaults to true.
 */
export declare const createItemDecoyModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
