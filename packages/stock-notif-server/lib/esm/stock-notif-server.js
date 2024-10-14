import { isUniversalServerRunning, runPassport, verifyObjectId } from '@open-stock/stock-universal-server';
import express from 'express';
import { notifSettingMain } from './models/notifsetting.model';
import { mailSenderRoutes } from './routes/mail.routes';
import { notifnRoutes } from './routes/notification.routes';
import { createNotificationsDatabase, createStockNotifServerLocals, isStockNotifServerRunning, notificationSettings } from './stock-notif-local';
import { constructMailService } from './utils/notifications';
import { createTwilioService, makeAuthyTwilio } from './utils/twilio';
export const createService = () => createTwilioService();
/**
   * Runs the stock notification server by setting up the necessary configurations,
   * connecting to the database, initializing passport authentication, and returning the notification routes.
   * @param {IstockNotifServerConfig} config - The server configuration.
   * @returns {Promise<{stockNotifRouter, notificationSettings}>}
   */
export const runStockNotificationServer = async (config) => {
    if (!isUniversalServerRunning()) {
        const error = new Error('File loacations must be handled properly, please start by firing up that server');
        throw error;
    }
    await createNotificationsDatabase(config.databaseConfig.url, config.databaseConfig.dbOptions);
    runPassport(config.jwtSecret, config.socialAuthStrategys);
    const twilioAuthy = makeAuthyTwilio(config.twilioAutyConfig.authyKey, config.twilioAutyConfig.accountSid, config.twilioAutyConfig.authToken);
    notificationSettings.twilioClient = twilioAuthy.twilioClient;
    notificationSettings.defaultAuthyMail = config.twilioAutyConfig.defaultMail;
    notificationSettings.twilioNumber = config.twilioAutyConfig.twilioNumber;
    notificationSettings.twilioVerificationSid = config.twilioAutyConfig.twilioVerificationSid;
    createStockNotifServerLocals();
    constructMailService(config.twilioAutyConfig.sendGridApiKey, config.notifSecrets.notifPublicKey, config.notifSecrets.notifPrivateKey);
    const stockNotifRouter = express.Router();
    stockNotifRouter.use('/notifn', notifnRoutes);
    stockNotifRouter.use('/mailsender', mailSenderRoutes);
    return { stockNotifRouter, notificationSettings };
};
/**
 * Retrieves the current notification settings.
 * @returns {Promise<TnotifSetting>} A promise that resolves to the current notification settings.
 */
export const getCurrentNotificationSettings = async (companyId) => {
    const isValid = verifyObjectId(companyId);
    if (!isValid) {
        return { success: false };
    }
    const stn = await notifSettingMain.findOne({ companyId }).lean();
    return { success: true, stn };
};
/**
 * Checks if the notifications server is running.
 * @returns {boolean} True if the notifications server is running, false otherwise.
 */
export const isNotificationsServerRunning = () => isStockNotifServerRunning;
//# sourceMappingURL=stock-notif-server.js.map