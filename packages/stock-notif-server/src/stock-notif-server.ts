/**
 * This file exports several interfaces and functions related to the stock notification server.
 *
 * @packageDocumentation
 */

import { makeAuthyTwilio } from './controllers/twilio.controller';
import { EmailHandler, SmsHandler } from './controllers/notifications.controller';
import { runPassport } from '@open-stock/stock-universal-server';
import { createNotificationsModel } from './models/mainnotification.model';
import { createNotifStnModel } from './models/notifsetting.model';
import { createSubscriptionModel } from './models/subscriptions.model';
import { notifnRoutes } from './routes/notification.routes';

/**
 * An interface representing the local path of the stock notification server.
 */
export interface IlocalPath {
  absolutepath: string;
  photoDirectory: string;
  videoDirectory: string;
}

/**
 * An interface representing the configuration for notifications.
 */
export interface InotifConfig {
  publicKey: string;
  privateKey: string;
  redirectUrl: string;
}

/**
 * An interface representing the authentication secrets for the stock notification server.
 */
export interface IlAuth {
  jwtSecret: string;
  cookieSecret: string;
}

/**
 * An interface representing the configuration for Twilio Authy.
 */
export interface ItwilioAuthyConfig {
  secret: string;
  accountSid: string;
  authToken: string;
  twilioNumber: string;
  authyKey: string;
  enableValidationSMS: string;
  sendGridApiKey: string;
}

/**
 * An instance of the SmsHandler class.
 */
export let smsHandler: SmsHandler;

/**
 * An instance of the EmailHandler class.
 */
export let emailHandler: EmailHandler;

/**
 * An interface representing the configuration for the stock notification server.
 */
export interface IstocknotifServerConfig {
  authSecrets: IlAuth;
  notificationsSettings: InotifConfig;
  twilioAuthySetings: ItwilioAuthyConfig;
  databaseConfigUrl: string;
  localPath: IlocalPath;
}

/**
 * Creates the notifications database.
 *
 * @param databaseUrl The URL of the database.
 * @returns A promise that resolves when the database is created.
 */
export const createNotificationsDatabase = (databaseUrl: string): Promise<void[]> => {
  return Promise.all([
    createNotificationsModel(databaseUrl),
    createNotifStnModel(databaseUrl),
    createSubscriptionModel(databaseUrl)
  ]);
};

/**
 * Runs the stock notification server.
 *
 * @param config The configuration for the stock notification server.
 * @param app The Express app.
 * @returns The notification routes.
 */
export const runStockNotificationServer = async(config: IstocknotifServerConfig, app: any): Promise<any> => {
  Object.keys(config.localPath).forEach(key => {
    app.locals[key] = config.localPath[key];
  });

  await createNotificationsDatabase(config.databaseConfigUrl);

  const { authy, twilioClient } = makeAuthyTwilio(
    config.twilioAuthySetings.authyKey, config.twilioAuthySetings.accountSid, config.twilioAuthySetings.authToken);
  smsHandler = new SmsHandler(authy, twilioClient, config.twilioAuthySetings.twilioNumber);
  emailHandler = new EmailHandler();

  runPassport(config.authSecrets.jwtSecret);

  return notifnRoutes;
};
