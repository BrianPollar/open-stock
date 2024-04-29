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
    authy: any;
    defaultAuthyMail: any;
    twilioNumber: any;
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
