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
import { ConnectOptions } from 'mongoose';
/**
 * Interface representing Twilio Authy secrets.
 */
export interface ItwilioAuthySecrets {
    authyKey: string;
    accountSid: string;
    authToken: string;
    defaultMail: string;
    twilioNumber: string;
    sendGridApiKey: string;
    twilioVerificationSid: string;
}
export interface InotifSecrets {
    notifPublicKey: string;
    notifPrivateKey: string;
    notifCallbacUrl: string;
}
/**
 * Represents the configuration for notifications.
 */
export interface InotificationConfig {
    smsDispatches: number;
    emailDispatches: number;
    twilioClient: any;
    defaultAuthyMail: any;
    twilioNumber: any;
    twilioVerificationSid: string;
}
/**
 * Represents the notification settings for the stock notification local module.
 */
export declare const notificationSettings: InotificationConfig;
/**
 * Indicates whether the stock notification server is currently running.
 */
export declare let isStockNotifServerRunning: boolean;
/**
 * Creates stock notification server locals.
 */
export declare const createStockNotifServerLocals: () => void;
/**
 * Creates the notifications database.
 *
 * @param databaseUrl The URL of the database.
 * @returns A promise that resolves when the database is created.
 */
export declare const createNotificationsDatabase: (databaseUrl: string, dbOptions?: ConnectOptions) => Promise<void>;
