/**
 * @fileoverview This file contains the Mongoose schema and model for the main notification object.
 * @packageDocumentation
 */
import { Document, Model } from 'mongoose';
import { Iactionwithall, TnotifType } from '@open-stock/stock-universal';
/** Interface for the main notification object. */
export interface IMainnotification extends Document {
    /** Actions to be taken for the notification. */
    actions: Iactionwithall[];
    /** ID of the user who will receive the notification. */
    userId: string;
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
 * @param main Whether to create the main Mongoose model or not.
 * @param lean Whether to create the lean Mongoose model or not.
 */
export declare const createNotificationsModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
