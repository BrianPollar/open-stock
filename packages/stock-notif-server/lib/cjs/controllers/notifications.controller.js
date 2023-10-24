"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeNotfnBody = exports.updateNotifnViewed = exports.sendLocalNotification = exports.createPayload = exports.ensureAllBulkNotifications = exports.sendAllNotifications = exports.createNotifSetting = exports.createNotifications = exports.constructMailService = exports.EmailHandler = exports.SmsHandler = exports.NotificationController = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-var-requires */
// import {
// PushSubscription,
// sendNotification,
// setVapidDetails,
// RequestOptions// ,
// generateVAPIDKeys
// } from 'web-push';
const webPush = tslib_1.__importStar(require("web-push"));
const log4js_1 = require("log4js");
const subscriptions_model_1 = require("../models/subscriptions.model");
const notifsetting_model_1 = require("../models/notifsetting.model");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mainnotification_model_1 = require("../models/mainnotification.model");
// const sgMail = require('@sendgrid/mail');
const sgMail = tslib_1.__importStar(require("@sendgrid/mail"));
const stock_notif_server_1 = require("../stock-notif-server");
/** */
const notificationsControllerLogger = (0, log4js_1.getLogger)('controllers/NotificationsController');
/** */
class NotificationController {
    /** */
    constructor() {
        /** */
        this.dispatchSinceOpen = 0;
        /** */
        this.smsDispatches = 0;
        /** */
        this.mailDispatches = 0;
    }
    /** */
    determineUserHasMail(user) {
        return Boolean(user.email);
    }
    /** */
    async createSettings() {
        const found = await notifsetting_model_1.notifSettingLean.find({}).lean();
        if (found.length > 0) {
            this.stn = found[0];
            return;
        }
        await (0, exports.createNotifSetting)({});
        this.stn = {
            invoices: true,
            payments: true,
            orders: true,
            jobCards: true,
            users: true
        };
    }
}
exports.NotificationController = NotificationController;
/** */
class SmsHandler extends NotificationController {
    /** */
    constructor(authy, twilioClient, twilioNumber) {
        super();
        this.authy = authy;
        this.twilioClient = twilioClient;
        this.twilioNumber = twilioNumber;
        /** */
        this.email = 'pollarbrian@hotmail.com';
    }
    /** */
    setUpUser(phone, countryCode) {
        return new Promise((resolve, reject) => {
            this.authy.register_user(this.email, phone, countryCode, (err, response) => {
                if (err) {
                    reject(err);
                    return;
                    // console.log('authy err is', err);
                }
                if (err || !response.user) {
                    reject(err);
                    return;
                }
                resolve(response);
            });
        });
    }
    /** */
    sendToken(authyId) {
        return new Promise((resolve, reject) => {
            this.authy.request_sms(authyId, true, 
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (err, response) => {
                if (response) {
                    resolve(response);
                }
                else {
                    reject(err);
                }
            });
        });
    }
    /** */
    sendSms(phone, countryCode, message) {
        return new Promise((resolve, reject) => {
            this.twilioClient.messages.create({
                to: countryCode + phone,
                from: this.twilioNumber,
                body: message
            }).then((response) => {
                this.smsDispatches++;
                resolve(response);
            })
                .catch(err => {
                if (err) {
                    reject(err);
                    return;
                }
            });
        });
    }
}
exports.SmsHandler = SmsHandler;
/** */
class EmailHandler extends NotificationController {
    constructor() {
        super();
    }
    /** */
    constructMail(to, subject, text, html, from = 'info@eagleinfosolutions.com') {
        return {
            from,
            to,
            subject,
            text,
            html
        };
    }
    /** */
    sendMail(mailOptions) {
        return new Promise((resolve, reject) => {
            sgMail
                .send(mailOptions)
                .then((res) => {
                this.mailDispatches++;
                notificationsControllerLogger.info('message sent', res);
                resolve(res);
            }, error => {
                notificationsControllerLogger.error('email verication with token error', JSON.stringify(error));
                reject(error);
            });
        });
    }
}
exports.EmailHandler = EmailHandler;
/** */
const constructMailService = (sendGridApiKey, publicKey, privateKey) => {
    sgMail.setApiKey(sendGridApiKey);
    // console.log(generateVAPIDKeys()); //generate key
    // console.log('those keys are', notifConfig);
    const vapidKeys = {
        publicKey,
        privateKey
    };
    const vapidDetails = {
        subject: 'mailto:info@eagleinfosolutions.com',
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey
    };
    webPush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);
    /* const options = {
      vapidDetails: {
        subject: 'mailto:example_email@example.com',
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey
      },
      TTL: 60
    };*/
};
exports.constructMailService = constructMailService;
/** create unregistered */
/** */
const createNotifications = async (body) => {
    const options = body.options;
    const filters = body.filters;
    notificationsControllerLogger.info('createNotifications %body, %filters', body, filters);
    const notifMain = new mainnotification_model_1.mainnotificationMain(options);
    let errResponse;
    await notifMain.save().catch(err => {
        const errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        return errResponse;
    });
    if (errResponse) {
        return errResponse;
    }
    const subscriptions = await subscriptions_model_1.subscriptionLean
        .find({ active: true, ...filters })
        .lean();
    await (0, exports.ensureAllBulkNotifications)(subscriptions, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [notifMain]);
    return { success: true, status: 200 };
};
exports.createNotifications = createNotifications;
/** */
const createNotifSetting = async (stn) => {
    let errResponse;
    const notifMain = new notifsetting_model_1.notifSettingMain(stn);
    await notifMain.save().catch(err => {
        const errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        return errResponse;
    });
    if (errResponse) {
        return errResponse;
    }
    return { success: true, status: 200 };
};
exports.createNotifSetting = createNotifSetting;
/** */
const sendAllNotifications = async (userLean) => {
    notificationsControllerLogger.info('sendAllNotifications');
    const all = await subscriptions_model_1.subscriptionLean
        .find({ active: true })
        .lean();
    await (0, exports.ensureAllBulkNotifications)(userLean, all);
};
exports.sendAllNotifications = sendAllNotifications;
/** */
const ensureAllBulkNotifications = async (userLean, subscriptions, notifications) => {
    const now = Date.now();
    const promises = subscriptions
        .map(async (sub) => {
        notificationsControllerLogger.debug('ensureAllBulkNotifications - subscriptions: ', sub);
        if (!notifications) {
            notifications = await mainnotification_model_1.mainnotificationLean
                .find({
                active: true
            })
                .gte('expireAt', now);
        }
        notifications
            .map(notif => {
            const payload = (0, exports.createPayload)(notif.title, notif.body, notif.icon, notif.actions);
            (0, exports.sendLocalNotification)(userLean, sub.subscription, payload);
        });
        return new Promise(resolve => {
            resolve(true);
        });
    });
    await Promise.all(promises);
};
exports.ensureAllBulkNotifications = ensureAllBulkNotifications;
/** */
const createPayload = (title, body, icon, actions = [
    { action: 'bar', title: 'Focus last', operation: 'focusLastFocusedOrOpen', url: '' },
    { action: 'baz', title: 'Navigate last', operation: 'focusLastFocusedOrOpen', url: '' }
]) => {
    // convert action into object
    const data = actions.reduce((obj, item) => ({
        ...obj,
        [item.action]: {
            operation: item.operation,
            url: item.url
        }
    }), {});
    const duplicateActions = actions
        .map(val => ({
        action: val.action,
        title: val.title
    }));
    const payload = {
        notification: {
            title,
            body,
            icon,
            duplicateActions,
            data: {
                onActionClick: {
                    default: { operation: 'openWindow' },
                    ...data
                }
            }
        }
    };
    notificationsControllerLogger.debug('createPayload - payload: ', payload);
    return payload;
};
exports.createPayload = createPayload;
/** */
const sendLocalNotification = async (userLean, subscription, /** : webPush.PushSubscription //TODO */ payload, options /* : webPush.RequestOptions // TODO */) => {
    notificationsControllerLogger.debug('sendLocalNotification - subscription', subscription);
    const isValid = (0, stock_universal_server_1.verifyObjectId)(subscription.userId);
    if (!isValid) {
        return; // Promise.resolve(false);
    }
    const user = await userLean
        .findById(subscription.userId).lean();
    webPush.sendNotification(subscription, JSON.stringify(payload), options).then(res => {
        notificationsControllerLogger.debug('sendLocalNotification - res: ', res);
        if (user) {
            if (stock_notif_server_1.emailHandler.determineUserHasMail(user)) {
                const mailOptions = stock_notif_server_1.emailHandler.constructMail(user.email, payload.title, payload.body, '');
                stock_notif_server_1.emailHandler.sendMail(mailOptions);
            }
            else {
                stock_notif_server_1.smsHandler.sendSms(user.phone, user.countryCode, payload.body);
            }
        }
    }).catch(err => {
        notificationsControllerLogger.error('sendLocalNotification - err: ', err);
    });
};
exports.sendLocalNotification = sendLocalNotification;
/** */
const updateNotifnViewed = async (user, id) => {
    notificationsControllerLogger.info('updateNotifnViewed - user: ', user);
    const { userId } = user;
    await mainnotification_model_1.mainnotificationMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .updateOne({ _id: id }, { $push: { viewed: userId } });
    return true;
};
exports.updateNotifnViewed = updateNotifnViewed;
/** */
const makeNotfnBody = (userId, title, body, notifType, actions, notifInvokerId) => {
    const notification = {
        actions,
        userId,
        title,
        notifType,
        notifInvokerId,
        body,
        icon: '',
        expireAt: Date.parse(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()),
        orders: false,
        payments: false,
        users: false,
        items: false,
        faqs: false,
        buyer: false,
        viewed: []
    };
    notificationsControllerLogger.debug('makeNotfnBody - notification', notification);
    return notification;
};
exports.makeNotfnBody = makeNotfnBody;
//# sourceMappingURL=notifications.controller.js.map