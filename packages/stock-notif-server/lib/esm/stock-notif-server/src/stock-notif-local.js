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
    authy: null,
    defaultAuthyMail: null,
    twilioNumber: null
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
export const createNotificationsDatabase = (databaseUrl) => {
    return Promise.all([
        createNotificationsModel(databaseUrl),
        createNotifStnModel(databaseUrl),
        createSubscriptionModel(databaseUrl)
    ]);
};
//# sourceMappingURL=stock-notif-local.js.map