"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotifStn = exports.createNotifications = exports.makeNotfnBody = exports.updateNotifnViewed = exports.createPayload = exports.createNotifSetting = exports.constructMailService = exports.sendMail = exports.constructMail = exports.verifyAuthyToken = exports.sendSms = exports.sendToken = exports.determineUserHasMail = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const webPush = tslib_1.__importStar(require("web-push"));
const mainnotification_model_1 = require("../models/mainnotification.model");
const notifsetting_model_1 = require("../models/notifsetting.model");
const stock_notif_local_1 = require("../stock-notif-local");
// const sgMail = require('@sendgrid/mail');
// import * as sgMail from '@sendgrid/mail';
const sgMail = require('@sendgrid/mail');
const notificationsControllerLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log('data.output err ', err);
                }
            }
        });
        fs.appendFile(logDir + '/notif-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
/**
 * Determines whether a user has an email address.
 * @param user - The user object.
 * @returns True if the user has an email address, false otherwise.
 */
const determineUserHasMail = (user) => {
    return Boolean(user.email);
};
exports.determineUserHasMail = determineUserHasMail;
/**
 * Creates notification settings.
 * @returns {Promise<InotifSetting>} The created notification settings.
 */
/* export const createSettings = async() => {
  let stn: InotifSetting;
  const found = await notifSettingLean.find({}).lean();
  if (found.length > 0) {
    stn = found[0] as unknown as InotifSetting;
    return;
  }
  await createNotifSetting({});
  stn = {
    invoices: true,
    payments: true,
    orders: true,
    jobCards: true,
    users: true
  };
  return stn;
}; */
/**
   * Registers a new user with Authy.
   * @param phone - The user's phone number.
   * @param countryCode - The user's country code.
   * @returns A promise that resolves with the Authy registration response.
   */
/* export const setUpUser = (
  phone: string | number,
  countryCode: string | number
) => {
  return new Promise((resolve, reject) => {
    notificationSettings.authy.register_user(
      notificationSettings.defaultAuthyMail,
      phone,
      countryCode,
      (err, response) => {
        if (err) {
          reject(err);
          return;
        }

        if (err || !response.user) {
          reject(err);
          return;
        }
        resolve(response);
      }
    );
  });
}; */
/**
   * Requests an SMS token from Authy for the given user.
   * @param authyId - The user's Authy ID.
   * @returns A promise that resolves with the Authy token request response.
   */
/* export const sendToken = () => {
  return new Promise((resolve, reject) => {
    notificationSettings.authy.request_sms(
      authyId,
      true,
      (err, response) => {
        if (response) {
          resolve(response);
        } else {
          reject(err);
        }
      });
  });
}; */
const sendToken = (phone, countryCode, message) => {
    return new Promise((resolve, reject) => {
        stock_notif_local_1.notificationSettings.twilioClient.verify.v2.services(stock_notif_local_1.notificationSettings.twilioVerificationSid)
            .verifications
            .create({ to: `${countryCode + phone.toString()}`, channel: 'sms' })
            .then(verification => {
            stock_notif_local_1.notificationSettings.smsDispatches++;
            resolve(verification);
        }).catch(err => {
            if (err) {
                reject(err);
                return;
            }
        });
        /* notificationSettings.twilioClient.messages.create({
          to: countryCode + phone.toString(),
          from: notificationSettings.twilioNumber,
          body: message
        }).then((response) => {
          notificationSettings.smsDispatches++;
          resolve({ response });
        }).catch(err => {
          if (err) {
            reject(err);
            return;
          }
        }); */
    });
};
exports.sendToken = sendToken;
/**
   * Sends an SMS message using Twilio.
   * @param phone - The recipient's phone number.
   * @param countryCode - The recipient's country code.
   * @param message - The message to send.
   * @returns A promise that resolves with the Twilio message send response.
   */
const sendSms = (phone, countryCode, message) => {
    return new Promise((resolve, reject) => {
        stock_notif_local_1.notificationSettings.twilioClient.messages.create({
            to: countryCode + phone,
            from: stock_notif_local_1.notificationSettings.twilioNumber,
            body: message
        }).then((response) => {
            stock_notif_local_1.notificationSettings.smsDispatches++;
            resolve({ response });
        }).catch(err => {
            if (err) {
                reject(err);
                return;
            }
        });
    });
};
exports.sendSms = sendSms;
/**
 * Verifies the Authy token for a given Authy ID.
 * @param authyId - The Authy ID of the user.
 * @param otp - The one-time password to be verified.
 * @returns A promise that resolves with the verification response or rejects with an error.
 */
const verifyAuthyToken = (phone, countryCode, code) => {
    return new Promise((resolve, reject) => {
        stock_notif_local_1.notificationSettings.twilioClient.verify.v2.services(stock_notif_local_1.notificationSettings.twilioVerificationSid)
            .verificationChecks
            .create({ to: `${countryCode + phone.toString()}`, code: `${code}` })
            .then(verification_check => {
            notificationsControllerLogger.debug('verification_check', verification_check);
            if (verification_check.status === 'approved') {
                resolve(verification_check.status);
            }
            else {
                reject(verification_check.status);
            }
        }).catch(err => {
            reject(err);
        });
        /* notificationSettings.authy.verify(authyId, otp, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        }); */
    });
};
exports.verifyAuthyToken = verifyAuthyToken;
/**
 * Constructs an email object with the specified parameters.
 * @param to - The recipient's email address.
 * @param subject - The subject of the email.
 * @param text - The plain text content of the email.
 * @param html - The HTML content of the email.
 * @param from - The sender's email address. Default is 'info@eagleinfosolutions.com'.
 * @returns An email object with the specified parameters.
 */
const constructMail = (to, subject, text, html, from = 'info@eagleinfosolutions.com') => {
    return {
        from,
        to,
        subject,
        text,
        html
    };
};
exports.constructMail = constructMail;
/**
 * Sends an email using the provided mail options.
 * @param {object} mailOptions - The options for sending the email.
 * @returns {Promise<object>} A promise that resolves with the response from sending the email.
 */
const sendMail = (mailOptions) => {
    return new Promise((resolve, reject) => {
        sgMail
            .send(mailOptions)
            .then((response) => {
            stock_notif_local_1.notificationSettings.emailDispatches++;
            notificationsControllerLogger.info('message sent', response);
            resolve({ response });
        }, error => {
            notificationsControllerLogger.error('email verication with token error', JSON.stringify(error));
            reject(error);
        });
    });
};
exports.sendMail = sendMail;
/**
 * Constructs a mail service with the provided SendGrid API key, public key, and private key.
 * @param sendGridApiKey - The SendGrid API key.
 * @param publicKey - The public key for VAPID authentication.
 * @param privateKey - The private key for VAPID authentication.
 */
const constructMailService = (sendGridApiKey, publicKey, privateKey) => {
    sgMail.setApiKey(sendGridApiKey);
    // notificationsControllerLogger.info(generateVAPIDKeys()); // generate key
    // notificationsControllerLogger.info('those keys are', notifConfig);
    const vapidKeys = {
        publicKey,
        privateKey
    };
    const vapidDetails = {
        subject: 'mailto:info@eagleinfosolutions.com', // my mail
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
    }; */
};
exports.constructMailService = constructMailService;
/**
 * Creates a notification setting.
 * @param stn - The notification setting to be created.
 * @returns A promise that resolves to an object indicating the success status and HTTP status code.
 */
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
/**
 * Creates a payload for a notification.
 * @param title - The title of the notification.
 * @param body - The body of the notification.
 * @param icon - The icon of the notification.
 * @param actions - An array of actions for the notification. Defaults to an array with two actions: "bar" and "baz".
 * @returns The payload object for the notification.
 */
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
/**
 * Updates the viewed status of a notification for a specific user.
 * @param user - The authenticated user.
 * @param _id - The ID of the notification to update.
 * @returns A boolean indicating whether the update was successful.
 */
const updateNotifnViewed = async (user, _id) => {
    notificationsControllerLogger.info('updateNotifnViewed - user: ', user);
    const { userId } = user;
    await mainnotification_model_1.mainnotificationMain
        .updateOne({ _id }, { $push: { viewed: userId } });
    return true;
};
exports.updateNotifnViewed = updateNotifnViewed;
/**
 * Creates a notification body object.
 * @param userId - The ID of the user receiving the notification.
 * @param title - The title of the notification.
 * @param body - The body content of the notification.
 * @param notifType - The type of the notification.
 * @param actions - An array of actions associated with the notification.
 * @param notifInvokerId - The ID of the entity that triggered the notification.
 * @returns The created notification body object.
 */
const makeNotfnBody = (userId, title, body, notifType, actions, notifInvokerId) => {
    const notification = {
        actions,
        userId,
        title,
        notifType,
        notifInvokerId,
        body,
        icon: '',
        expireAt: Date.parse(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()).toString(),
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
const createNotifications = async (data) => {
    const newNotifn = new mainnotification_model_1.mainnotificationMain(data.notification);
    await newNotifn.save().catch(err => {
        if (err) {
            notificationsControllerLogger.error('save Error', err);
        }
    });
    return true;
};
exports.createNotifications = createNotifications;
const createNotifStn = async (stn) => {
    const notifMain = new notifsetting_model_1.notifSettingMain(stn);
    let errResponse;
    await notifMain.save().catch(err => {
        errResponse = {
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
    return {
        success: true,
        status: 200
    };
};
exports.createNotifStn = createNotifStn;
//# sourceMappingURL=notifications.js.map