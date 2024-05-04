import { ConnectOptions } from 'mongoose';
import { createNotificationsModel } from './models/mainnotification.model';
import { createNotifStnModel } from './models/notifsetting.model';
import { createSubscriptionModel } from './models/subscriptions.model';

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
  twilioClient;
  defaultAuthyMail;
  twilioNumber;
  twilioVerificationSid: string;
}

/**
 * Represents the notification settings for the stock notification local module.
 */
export const notificationSettings: InotificationConfig = {
  smsDispatches: 0,
  emailDispatches: 0,
  twilioClient: null,
  defaultAuthyMail: null,
  twilioNumber: null,
  twilioVerificationSid: ''
};

/**
 * Indicates whether the stock notification server is currently running.
 */
export let isStockNotifServerRunning = false;

/**
 * Creates stock notification server locals.
 */
export const createStockNotifServerLocals = () => {
  isStockNotifServerRunning = true;
};

/**
 * Creates the notifications database.
 *
 * @param databaseUrl The URL of the database.
 * @returns A promise that resolves when the database is created.
 */
export const createNotificationsDatabase = async(databaseUrl: string, dbOptions?: ConnectOptions): Promise<void> => {
  await Promise.all([
    createNotificationsModel(databaseUrl, dbOptions),
    createNotifStnModel(databaseUrl, dbOptions),
    createSubscriptionModel(databaseUrl, dbOptions)
  ]);
};
