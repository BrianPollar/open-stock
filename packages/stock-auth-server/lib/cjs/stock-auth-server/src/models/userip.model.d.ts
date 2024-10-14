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
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
/**
 * Represents a user IP model.
 */
export interface IUserip extends Document {
    /**
     * The ID of the user or company.
     */
    userOrCompanayId: string | Schema.Types.ObjectId;
    /**
     * List of green IPs.
     */
    greenIps: string[];
    /**
     * List of red IPs.
     */
    redIps: string[];
    /**
     * List of unverified IPs.
     */
    unverifiedIps: string[];
    /**
     * Indicates if the user is blocked.
     */
    blocked: any;
    /**
     * The date and time when the user IP was last updated.
     */
    updatedAt: string;
    /**
     * The date and time when the user IP was created.
     */
    createdAt: string;
}
/**
 * Represents the userip variable.
 */
export declare let userip: Model<IUserip>;
/**
 * Represents a lean user IP model.
 */
export declare let useripLean: Model<IUserip>;
/**
 * Creates an email token model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export declare const createUseripModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
