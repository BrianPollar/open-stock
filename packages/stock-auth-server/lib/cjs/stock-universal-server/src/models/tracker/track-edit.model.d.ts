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
import { ItrackEdit } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
export type TtrackEdit = Document & ItrackEdit;
/**
 * Represents the main subscription package model.
 */
export declare let trackEditMain: Model<TtrackEdit>;
/**
 * Represents a lean subscription package model.
 */
export declare let trackEditLean: Model<TtrackEdit>;
/**
 * Selects the trackEditselect constant from the trackEdit.model module.
 */
export declare const trackEditSelect: {
    parent: number;
    createdBy: number;
    users: number;
    deletedBy: number;
    collectionName: number;
};
/**
 * Creates a new subscription package model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export declare const createTrackEditModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
