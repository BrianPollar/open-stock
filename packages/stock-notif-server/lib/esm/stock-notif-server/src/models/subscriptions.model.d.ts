/**
 * @file This file defines the Mongoose schema and model for the subscription collection.
 * @requires mongoose
 * @requires ../controllers/database.controller
 * @requires mongoose-unique-validator
 */
import { Document, Model } from 'mongoose';
/**
 * Interface for the subscription document.
 */
export interface ISubscription extends Document {
    subscription: any;
    userId: string;
}
/**
 * Represents the main subscription model.
 */
export declare let subscriptionMain: Model<ISubscription>;
/**
 * Represents a lean subscription model.
 */
export declare let subscriptionLean: Model<ISubscription>;
/**
 * Represents the subscription select function.
 */
export declare const subscriptionSelect: {
    subscription: number;
    userId: number;
};
/**
 * Creates the Mongoose model for the subscription collection.
 * @param dbUrl - The URL of the database to connect to.
 * @param main - Whether to create the main connection.
 * @param lean - Whether to create the lean connection.
 */
export declare const createSubscriptionModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
