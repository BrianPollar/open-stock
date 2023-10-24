import { makeAuthyTwilio } from './controllers/twilio.controller';
import { EmailHandler, SmsHandler } from './controllers/notifications.controller';
import { runPassport } from '@open-stock/stock-universal-server';
import { createNotificationsModel } from './models/mainnotification.model';
import { createNotifStnModel } from './models/notifsetting.model';
import { createSubscriptionModel } from './models/subscriptions.model';
import { notifnRoutes } from './routes/notification.routes';
export let smsHandler;
export let emailHandler;
/** */
export const createNotificationsDatabase = (databaseUrl) => {
    return Promise.all([
        createNotificationsModel(databaseUrl),
        createNotifStnModel(databaseUrl),
        createSubscriptionModel(databaseUrl)
    ]);
};
/** */
export const runStockNotificationServer = async (config, app) => {
    Object.keys(config.localPath).forEach(key => {
        app.locals[key] = config.localPath[key];
    });
    // connect models
    await createNotificationsDatabase(config.databaseConfigUrl);
    const { authy, twilioClient } = makeAuthyTwilio(config.twilioAuthySetings.authyKey, config.twilioAuthySetings.accountSid, config.twilioAuthySetings.authToken);
    smsHandler = new SmsHandler(authy, twilioClient, config.twilioAuthySetings.twilioNumber);
    emailHandler = new EmailHandler();
    runPassport(config.authSecrets.jwtSecret);
    // NotificationController.createSettings();
    return notifnRoutes;
};
//# sourceMappingURL=stock-notif-server.js.map