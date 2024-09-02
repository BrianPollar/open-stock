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
