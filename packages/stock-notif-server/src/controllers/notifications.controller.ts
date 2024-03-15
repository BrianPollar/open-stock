/* eslint-disable @typescript-eslint/no-var-requires */
// import {
// PushSubscription,
// sendNotification,
// setVapidDetails,
// RequestOptions// ,
// generateVAPIDKeys
// } from 'web-push';
import { Iaction, Iactionwithall, Iauthtoken, InotifSetting, Isuccess, Iuser, TnotifType } from '@open-stock/stock-universal';
import { stringifyMongooseErr } from '@open-stock/stock-universal-server';
import { getLogger } from 'log4js';
import * as webPush from 'web-push';
import { mainnotificationMain } from '../models/mainnotification.model';
import { notifSettingLean, notifSettingMain } from '../models/notifsetting.model';
// const sgMail = require('@sendgrid/mail');
import * as sgMail from '@sendgrid/mail';
import { notificationSettings } from '../stock-notif-local';


const notificationsControllerLogger = getLogger('controllers/NotificationsController');

/**
 * Determines whether a user has an email address.
 * @param user - The user object.
 * @returns True if the user has an email address, false otherwise.
 */
export const determineUserHasMail = (user: Iuser) => {
  return Boolean(user.email);
};

/**
 * Creates notification settings.
 * @returns {Promise<InotifSetting>} The created notification settings.
 */
export const createSettings = async() => {
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
};

/**
   * Registers a new user with Authy.
   * @param phone - The user's phone number.
   * @param countryCode - The user's country code.
   * @returns A promise that resolves with the Authy registration response.
   */
export const setUpUser = (
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
};

/**
   * Requests an SMS token from Authy for the given user.
   * @param authyId - The user's Authy ID.
   * @returns A promise that resolves with the Authy token request response.
   */
export const sendToken = (
  authyId: string
) => {
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
};

/**
   * Sends an SMS message using Twilio.
   * @param phone - The recipient's phone number.
   * @param countryCode - The recipient's country code.
   * @param message - The message to send.
   * @returns A promise that resolves with the Twilio message send response.
   */
export const sendSms = (
  phone: string,
  countryCode: string,
  message: string
) => {
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
export const verifyAuthyToken = (authyId: string, otp) => {
  return new Promise((resolve, reject) => {
    notificationSettings.authy.verify(authyId, otp, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
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
export const constructMail = (
  to: string,
  subject: string,
  text: string,
  html: string,
  from = 'info@eagleinfosolutions.com'
) => {
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
export const sendMail = async(mailOptions) => {
  return new Promise((resolve, reject) => {
    sgMail
      .send(mailOptions)
      .then((response) => {
        notificationSettings.emailDispatches++;
        notificationsControllerLogger.info('message sent', response);
        resolve({ response });
      }, error => {
        notificationsControllerLogger.error('email verication with token error',
          JSON.stringify(error));
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
export const constructMailService = (
  sendGridApiKey: string,
  publicKey: string,
  privateKey: string
) => {
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
  webPush.setVapidDetails(vapidDetails.subject,
    vapidDetails.publicKey,
    vapidDetails.privateKey);
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
export const createNotifSetting = async(stn): Promise<Isuccess> => {
  let errResponse: Isuccess;
  const notifMain = new notifSettingMain(stn);
  await notifMain.save().catch(err => {
    const errResponse: Isuccess = {
      success: false,
      status: 403
    };
    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
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
export const createPayload = (
  title: string,
  body: string,
  icon: string,
  actions: Iactionwithall[] = [
    { action: 'bar', title: 'Focus last', operation: 'focusLastFocusedOrOpen', url: '' },
    { action: 'baz', title: 'Navigate last', operation: 'focusLastFocusedOrOpen', url: '' }
  ]
) => {
  // convert action into object
  const data = actions.reduce((obj, item) => ({
    ...obj,
    [item.action]: {
      operation: item.operation,
      url: item.url
    }
  }), {});
  const duplicateActions: Iaction[] = actions
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
export const updateNotifnViewed = async(user: Iauthtoken, id: string) => {
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
export const makeNotfnBody = (
  userId: string,
  title: string,
  body: string,
  notifType: TnotifType,
  actions: Iactionwithall[],
  notifInvokerId: string
) => {
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


