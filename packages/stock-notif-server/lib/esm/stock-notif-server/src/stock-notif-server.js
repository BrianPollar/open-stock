import { isUniversalServerRunning, runPassport } from '@open-stock/stock-universal-server';
import express from 'express';
import { makeAuthyTwilio } from './controllers/twilio.controller';
import { notifSettingMain } from './models/notifsetting.model';
import { mailSenderRoutesDummy } from './routes-dummy/mail.routes';
import { notifnRoutesDummy } from './routes-dummy/notification.routes';
import { mailSenderRoutes } from './routes/mail.routes';
import { notifnRoutes } from './routes/notification.routes';
import { createNotificationsDatabase, createStockNotifServerLocals, isStockNotifServerRunning, notificationSettings } from './stock-notif-local';
export const runStockNotificationServer = async (config) => {
    if (!isUniversalServerRunning()) {
        const error = new Error('File loacations must be handled properly, please start by firing up that server');
        throw error;
    }
    await createNotificationsDatabase(config.databaseConfig.url, config.databaseConfig.dbOptions);
    runPassport(config.jwtSecret);
    const twilioAuthy = makeAuthyTwilio(config.twilioAutyConfig.authyKey, config.twilioAutyConfig.accountSid, config.twilioAutyConfig.authToken);
    notificationSettings.twilioClient = twilioAuthy.twilioClient;
    notificationSettings.authy = twilioAuthy.authy;
    notificationSettings.defaultAuthyMail = config.twilioAutyConfig.defaultMail;
    notificationSettings.twilioNumber = config.twilioAutyConfig.twilioNumber;
    createStockNotifServerLocals();
    const stockNotifRouter = express.Router();
    if (!config.useDummyRoutes) {
        stockNotifRouter.use('/notifn', notifnRoutes);
        stockNotifRouter.use('/mailsender', mailSenderRoutes);
    }
    else {
        stockNotifRouter.use('/notifn', notifnRoutesDummy);
        stockNotifRouter.use('/mailsender', mailSenderRoutesDummy);
    }
    return Promise.resolve({ stockNotifRouter, notificationSettings });
};
/**
 * Retrieves the current notification settings.
 * @returns {Promise<TnotifSetting>} A promise that resolves to the current notification settings.
 */
export const getCurrentNotificationSettings = async () => {
    const stn = await notifSettingMain.findOne({}).lean();
    return stn;
};
/**
 * Checks if the notifications server is running.
 * @returns {boolean} True if the notifications server is running, false otherwise.
 */
export const isNotificationsServerRunning = () => isStockNotifServerRunning;
//# sourceMappingURL=stock-notif-server.js.map