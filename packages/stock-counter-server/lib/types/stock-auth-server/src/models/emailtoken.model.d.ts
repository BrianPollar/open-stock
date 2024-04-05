/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Document, Model } from 'mongoose';
/**
 * Represents an email token.
 */
export interface IEmailtoken extends Document {
    /**
     * The ID of the user associated with the token.
     */
    userId: string;
    /**
     * The token value.
     */
    token: string;
    /**
     * The date and time when the token was last updated.
     */
    updatedAt: string;
    /**
     * The date and time when the token was created.
     */
    createdAt: string;
}
/**
 * Represents the email token model.
 */
export declare let emailtoken: Model<IEmailtoken>;
/**
 * Represents a lean version of the email token model.
 */
export declare let emailtokenLean: Model<IEmailtoken>;
/**
 * Creates an email token model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export declare const createEmailtokenModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
