"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStockNotificationServer = exports.createNotificationsDatabase = exports.emailHandler = exports.smsHandler = void 0;
const twilio_controller_1 = require("./controllers/twilio.controller");
const notifications_controller_1 = require("./controllers/notifications.controller");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mainnotification_model_1 = require("./models/mainnotification.model");
const notifsetting_model_1 = require("./models/notifsetting.model");
const subscriptions_model_1 = require("./models/subscriptions.model");
const notification_routes_1 = require("./routes/notification.routes");
/** */
const createNotificationsDatabase = (databaseUrl) => {
    return Promise.all([
        (0, mainnotification_model_1.createNotificationsModel)(databaseUrl),
        (0, notifsetting_model_1.createNotifStnModel)(databaseUrl),
        (0, subscriptions_model_1.createSubscriptionModel)(databaseUrl)
    ]);
};
exports.createNotificationsDatabase = createNotificationsDatabase;
/** */
const runStockNotificationServer = async (config, app) => {
    Object.keys(config.localPath).forEach(key => {
        app.locals[key] = config.localPath[key];
    });
    // connect models
    await (0, exports.createNotificationsDatabase)(config.databaseConfigUrl);
    const { authy, twilioClient } = (0, twilio_controller_1.makeAuthyTwilio)(config.twilioAuthySetings.authyKey, config.twilioAuthySetings.accountSid, config.twilioAuthySetings.authToken);
    exports.smsHandler = new notifications_controller_1.SmsHandler(authy, twilioClient, config.twilioAuthySetings.twilioNumber);
    exports.emailHandler = new notifications_controller_1.EmailHandler();
    (0, stock_universal_server_1.runPassport)(config.authSecrets.jwtSecret);
    // NotificationController.createSettings();
    return notification_routes_1.notifnRoutes;
};
exports.runStockNotificationServer = runStockNotificationServer;
//# sourceMappingURL=stock-notif-server.js.map