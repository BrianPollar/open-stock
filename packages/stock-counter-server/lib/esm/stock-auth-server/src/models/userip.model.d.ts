import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents a user IP model.
 */
export interface IUserip extends Document {
    /**
     * The ID of the user or company.
     */
    userOrCompanayId: string;
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
