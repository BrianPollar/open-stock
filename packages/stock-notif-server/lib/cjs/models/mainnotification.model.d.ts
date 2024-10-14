/**
 * @fileoverview This file contains the Mongoose schema and model for the main notification object.
 * @packageDocumentation
 */
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/schematypes" />
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
import { Iactionwithall, TnotifType } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
/** Interface for the main notification object. */
export interface IMainnotification extends Document {
    /** Actions to be taken for the notification. */
    actions: Iactionwithall[];
    /** ID of the user who will receive the notification. */
    userId: string | Schema.Types.ObjectId;
    /** Title of the notification. */
    title: string;
    /** Body of the notification. */
    body: string;
    /** Icon to be displayed with the notification. */
    icon: string;
    /** Expiration time of the notification in milliseconds. */
    expireAt: number;
    /** Type of the notification. */
    notifType: TnotifType;
    /** ID of the object that invoked the notification. */
    notifInvokerId: string;
    /** Whether the notification is active or not. */
    active: boolean;
    /** Array of user IDs who have viewed the notification. */
    viewed: string[];
}
/**
 * Represents the main notification model.
 */
export declare let mainnotificationMain: Model<IMainnotification>;
/**
 * Represents the mainnotificationLean variable.
 */
export declare let mainnotificationLean: Model<IMainnotification>;
/**
 * Creates the Mongoose models for the main notification object.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main Mongoose model or not.
 * @param lean Whether to create the lean Mongoose model or not.
 */
export declare const createNotificationsModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
