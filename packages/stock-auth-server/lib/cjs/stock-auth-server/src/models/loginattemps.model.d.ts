/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a login attempt.
 */
export interface IloginAttempts extends Document {
    /**
     * The ID of the user attempting to login.
     */
    userId: string;
    /**
     * The IP address from which the login attempt was made.
     */
    ip: string;
    /**
     * Indicates whether the login attempt was successful or not.
     */
    successful: boolean;
    /**
     * The date and time when the login attempt was last updated.
     */
    updatedAt: string;
    /**
     * The date and time when the login attempt was created.
     */
    createdAt: string;
}
/**
 * Represents the login attempts model.
 */
export declare let loginAtempts: Model<IloginAttempts>;
/**
 * Represents a variable that holds a lean model of login attempts.
 */
export declare let loginAtemptsLean: Model<IloginAttempts>;
/**
 * Creates a login attempts model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export declare const createLoginAtemptsModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
