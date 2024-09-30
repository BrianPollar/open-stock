import { createNotificationsModel } from './models/mainnotification.model';
import { createNotifStnModel } from './models/notifsetting.model';
import { createSubscriptionModel } from './models/subscriptions.model';
/**
 * Represents the notification settings for the stock notification local module.
 */
export const notificationSettings = {
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
export const createNotificationsDatabase = async (databaseUrl, dbOptions) => {
    await Promise.all([
        createNotificationsModel(databaseUrl, dbOptions),
        createNotifStnModel(databaseUrl, dbOptions),
        createSubscriptionModel(databaseUrl, dbOptions)
    ]);
};
//# sourceMappingURL=stock-notif-local.js.map