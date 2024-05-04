import { stringifyMongooseErr } from '@open-stock/stock-universal-server';
import * as tracer from 'tracer';
import * as webPush from 'web-push';
import { mainnotificationMain } from '../models/mainnotification.model';
import { notifSettingLean, notifSettingMain } from '../models/notifsetting.model';
import { notificationSettings } from '../stock-notif-local';
import * as fs from 'fs';
// const sgMail = require('@sendgrid/mail');
// import * as sgMail from '@sendgrid/mail';
const sgMail = require('@sendgrid/mail');
const notificationsControllerLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = './openstockLog/';
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    throw err;
                }
            }
        });
        fs.appendFile('./openStockLog/notif-server.log', data.rawoutput + '\n', err => {
            if (err) {
                throw err;
            }
        });
    }
});
/**
 * Determines whether a user has an email address.
 * @param user - The user object.
 * @returns True if the user has an email address, false otherwise.
 */
export const determineUserHasMail = (user) => {
    return Boolean(user.email);
};
/**
 * Creates notification settings.
 * @returns {Promise<InotifSetting>} The created notification settings.
 */
export const createSettings = async () => {
    let stn;
    const found = await notifSettingLean.find({}).lean();
    if (found.length > 0) {
        stn = found[0];
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
};
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
};*/
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
};*/
export const sendToken = (phone, countryCode, message) => {
    return new Promise((resolve, reject) => {
        notificationSettings.twilioClient.verify.v2.services(notificationSettings.twilioVerificationSid)
            .verifications
            .create({ to: `${countryCode + phone.toString()}`, channel: 'sms' })
            .then(verification => {
            notificationSettings.smsDispatches++;
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
        });*/
    });
};
/**
   * Sends an SMS message using Twilio.
   * @param phone - The recipient's phone number.
   * @param countryCode - The recipient's country code.
   * @param message - The message to send.
   * @returns A promise that resolves with the Twilio message send response.
   */
export const sendSms = (phone, countryCode, message) => {
    return new Promise((resolve, reject) => {
        notificationSettings.twilioClient.messages.create({
            to: countryCode + phone,
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
        });
    });
};
/**
 * Verifies the Authy token for a given Authy ID.
 * @param authyId - The Authy ID of the user.
 * @param otp - The one-time password to be verified.
 * @returns A promise that resolves with the verification response or rejects with an error.
 */
export const verifyAuthyToken = (phone, countryCode, code) => {
    return new Promise((resolve, reject) => {
        notificationSettings.twilioClient.verify.v2.services(notificationSettings.twilioVerificationSid)
            .verificationChecks
            .create({ to: `${countryCode + phone.toString()}`, code: `${code}` })
            // eslint-disable-next-line @typescript-eslint/naming-convention
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
        });*/
    });
};
/**
 * Constructs an email object with the specified parameters.
 * @param to - The recipient's email address.
 * @param subject - The subject of the email.
 * @param text - The plain text content of the email.
 * @param html - The HTML content of the email.
 * @param from - The sender's email address. Default is 'info@eagleinfosolutions.com'.
 * @returns An email object with the specified parameters.
 */
export const constructMail = (to, subject, text, html, from = 'info@eagleinfosolutions.com') => {
    return {
        from,
        to,
        subject,
        text,
        html
    };
};
/**
 * Sends an email using the provided mail options.
 * @param {object} mailOptions - The options for sending the email.
 * @returns {Promise<object>} A promise that resolves with the response from sending the email.
 */
export const sendMail = async (mailOptions) => {
    return new Promise((resolve, reject) => {
        sgMail
            .send(mailOptions)
            .then((response) => {
            notificationSettings.emailDispatches++;
            notificationsControllerLogger.info('message sent', response);
            resolve({ response });
        }, error => {
            notificationsControllerLogger.error('email verication with token error', JSON.stringify(error));
            reject(error);
        });
    });
};
/**
 * Constructs a mail service with the provided SendGrid API key, public key, and private key.
 * @param sendGridApiKey - The SendGrid API key.
 * @param publicKey - The public key for VAPID authentication.
 * @param privateKey - The private key for VAPID authentication.
 */
export const constructMailService = (sendGridApiKey, publicKey, privateKey) => {
    sgMail.setApiKey(sendGridApiKey);
    // notificationsControllerLogger.info(generateVAPIDKeys()); // generate key
    // notificationsControllerLogger.info('those keys are', notifConfig);
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
/**
 * Creates a notification setting.
 * @param stn - The notification setting to be created.
 * @returns A promise that resolves to an object indicating the success status and HTTP status code.
 */
export const createNotifSetting = async (stn) => {
    let errResponse;
    const notifMain = new notifSettingMain(stn);
    await notifMain.save().catch(err => {
        const errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
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
/**
 * Creates a payload for a notification.
 * @param title - The title of the notification.
 * @param body - The body of the notification.
 * @param icon - The icon of the notification.
 * @param actions - An array of actions for the notification. Defaults to an array with two actions: "bar" and "baz".
 * @returns The payload object for the notification.
 */
export const createPayload = (title, body, icon, actions = [
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
/**
 * Updates the viewed status of a notification for a specific user.
 * @param user - The authenticated user.
 * @param id - The ID of the notification to update.
 * @returns A boolean indicating whether the update was successful.
 */
export const updateNotifnViewed = async (user, id) => {
    notificationsControllerLogger.info('updateNotifnViewed - user: ', user);
    const { userId } = user;
    await mainnotificationMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .updateOne({ _id: id }, { $push: { viewed: userId } });
    return true;
};
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
export const makeNotfnBody = (userId, title, body, notifType, actions, notifInvokerId) => {
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
//# sourceMappingURL=notifications.controller.js.map