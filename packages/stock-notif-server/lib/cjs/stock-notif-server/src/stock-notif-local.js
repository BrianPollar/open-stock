"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationsDatabase = exports.createStockNotifServerLocals = exports.isStockNotifServerRunning = exports.notificationSettings = void 0;
const mainnotification_model_1 = require("./models/mainnotification.model");
const notifsetting_model_1 = require("./models/notifsetting.model");
const subscriptions_model_1 = require("./models/subscriptions.model");
/**
 * Represents the notification settings for the stock notification local module.
 */
exports.notificationSettings = {
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
exports.isStockNotifServerRunning = false;
/**
 * Creates stock notification server locals.
 */
const createStockNotifServerLocals = () => {
    exports.isStockNotifServerRunning = true;
};
exports.createStockNotifServerLocals = createStockNotifServerLocals;
/**
 * Creates the notifications database.
 *
 * @param databaseUrl The URL of the database.
 * @returns A promise that resolves when the database is created.
 */
const createNotificationsDatabase = async (databaseUrl, dbOptions) => {
    await Promise.all([
        (0, mainnotification_model_1.createNotificationsModel)(databaseUrl, dbOptions),
        (0, notifsetting_model_1.createNotifStnModel)(databaseUrl, dbOptions),
        (0, subscriptions_model_1.createSubscriptionModel)(databaseUrl, dbOptions)
    ]);
};
exports.createNotificationsDatabase = createNotificationsDatabase;
//# sourceMappingURL=stock-notif-local.js.map