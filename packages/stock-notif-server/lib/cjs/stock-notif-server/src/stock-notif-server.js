"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotificationsServerRunning = exports.getCurrentNotificationSettings = exports.runStockNotificationServer = exports.createService = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const notifsetting_model_1 = require("./models/notifsetting.model");
const mail_routes_1 = require("./routes-dummy/mail.routes");
const notification_routes_1 = require("./routes-dummy/notification.routes");
const mail_routes_2 = require("./routes/mail.routes");
const notification_routes_2 = require("./routes/notification.routes");
const stock_notif_local_1 = require("./stock-notif-local");
const notifications_1 = require("./utils/notifications");
const twilio_1 = require("./utils/twilio");
const createService = () => (0, twilio_1.createTwilioService)();
exports.createService = createService;
/**
   * Runs the stock notification server by setting up the necessary configurations, connecting to the database, initializing passport authentication, and returning the notification routes.
   * @param {IstockNotifServerConfig} config - The server configuration.
   * @returns {Promise<{stockNotifRouter, notificationSettings}>}
   */
const runStockNotificationServer = async (config) => {
    if (!(0, stock_universal_server_1.isUniversalServerRunning)()) {
        const error = new Error('File loacations must be handled properly, please start by firing up that server');
        throw error;
    }
    await (0, stock_notif_local_1.createNotificationsDatabase)(config.databaseConfig.url, config.databaseConfig.dbOptions);
    (0, stock_universal_server_1.runPassport)(config.jwtSecret);
    const twilioAuthy = (0, twilio_1.makeAuthyTwilio)(config.twilioAutyConfig.authyKey, config.twilioAutyConfig.accountSid, config.twilioAutyConfig.authToken);
    stock_notif_local_1.notificationSettings.twilioClient = twilioAuthy.twilioClient;
    stock_notif_local_1.notificationSettings.defaultAuthyMail = config.twilioAutyConfig.defaultMail;
    stock_notif_local_1.notificationSettings.twilioNumber = config.twilioAutyConfig.twilioNumber;
    stock_notif_local_1.notificationSettings.twilioVerificationSid = config.twilioAutyConfig.twilioVerificationSid;
    (0, stock_notif_local_1.createStockNotifServerLocals)();
    (0, notifications_1.constructMailService)(config.twilioAutyConfig.sendGridApiKey, config.notifSecrets.notifPublicKey, config.notifSecrets.notifPrivateKey);
    const stockNotifRouter = express_1.default.Router();
    if (!config.useDummyRoutes) {
        stockNotifRouter.use('/notifn', notification_routes_2.notifnRoutes);
        stockNotifRouter.use('/mailsender', mail_routes_2.mailSenderRoutes);
    }
    else {
        stockNotifRouter.use('/notifn', notification_routes_1.notifnRoutesDummy);
        stockNotifRouter.use('/mailsender', mail_routes_1.mailSenderRoutesDummy);
    }
    return Promise.resolve({ stockNotifRouter, notificationSettings: stock_notif_local_1.notificationSettings });
};
exports.runStockNotificationServer = runStockNotificationServer;
/**
 * Retrieves the current notification settings.
 * @returns {Promise<TnotifSetting>} A promise that resolves to the current notification settings.
 */
const getCurrentNotificationSettings = async (companyId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyId);
    if (!isValid) {
        return { success: false };
    }
    const stn = await notifsetting_model_1.notifSettingMain.findOne({ companyId }).lean();
    return { success: true, stn };
};
exports.getCurrentNotificationSettings = getCurrentNotificationSettings;
/**
 * Checks if the notifications server is running.
 * @returns {boolean} True if the notifications server is running, false otherwise.
 */
const isNotificationsServerRunning = () => stock_notif_local_1.isStockNotifServerRunning;
exports.isNotificationsServerRunning = isNotificationsServerRunning;
//# sourceMappingURL=stock-notif-server.js.map