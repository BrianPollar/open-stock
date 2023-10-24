/* eslint-disable @typescript-eslint/no-var-requires */
// import {
// PushSubscription,
// sendNotification,
// setVapidDetails,
// RequestOptions// ,
// generateVAPIDKeys
// } from 'web-push';
import * as webPush from 'web-push';
import { getLogger } from 'log4js';
import { ISubscription, subscriptionLean } from '../models/subscriptions.model';
import { notifSettingLean, notifSettingMain } from '../models/notifsetting.model';
import { Iaction, Iactionwithall, Iauthtoken, InotifSetting, Isuccess, Iuser, TnotifType } from '@open-stock/stock-universal';
import { stringifyMongooseErr, verifyObjectId } from '@open-stock/stock-universal-server';
import { IMainnotification, mainnotificationLean, mainnotificationMain } from '../models/mainnotification.model';
// const sgMail = require('@sendgrid/mail');
import * as sgMail from '@sendgrid/mail';
import { emailHandler, smsHandler } from '../stock-notif-server';

/** */
const notificationsControllerLogger = getLogger('controllers/NotificationsController');

/** */
export class NotificationController {
  /** */
  stn: InotifSetting;

  /** */
  dispatchSinceOpen = 0;

  /** */
  smsDispatches = 0;

  /** */
  mailDispatches = 0;

  /** */
  constructor() {}

  /** */
  determineUserHasMail(user: Iuser) {
    return Boolean(user.email);
  }

  /** */
  async createSettings() {
    const found = await notifSettingLean.find({}).lean();
    if (found.length > 0) {
      this.stn = found[0] as unknown as InotifSetting;
      return;
    }
    await createNotifSetting({});
    this.stn = {
      invoices: true,
      payments: true,
      orders: true,
      jobCards: true,
      users: true
    };
  }
}

/** */
/**
 * Handles sending SMS notifications using Twilio and Authy.
 */
export class SmsHandler extends NotificationController {
  /** The email address to use for Authy registration. */
  email = 'pollarbrian@hotmail.com';

  /**
   * Creates a new SmsHandler instance.
   * @param authy - The Authy instance to use for registration and token requests.
   * @param twilioClient - The Twilio client instance to use for sending SMS messages.
   * @param twilioNumber - The Twilio phone number to use as the sender.
   */
  constructor(
    public authy: any,
    public twilioClient: any,
    public twilioNumber: string | number
  ) {
    super();
  }

  /**
   * Registers a new user with Authy.
   * @param phone - The user's phone number.
   * @param countryCode - The user's country code.
   * @returns A promise that resolves with the Authy registration response.
   */
  setUpUser(
    phone: string | number,
    countryCode: string | number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authy.register_user(
        this.email,
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
  }

  /**
   * Requests an SMS token from Authy for the given user.
   * @param authyId - The user's Authy ID.
   * @returns A promise that resolves with the Authy token request response.
   */
  sendToken(authyId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authy.request_sms(
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
  }

  /**
   * Sends an SMS message using Twilio.
   * @param phone - The recipient's phone number.
   * @param countryCode - The recipient's country code.
   * @param message - The message to send.
   * @returns A promise that resolves with the Twilio message send response.
   */
  sendSms(
    phone: string,
    countryCode: string,
    message: string
  ): Promise<any> {
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

/** */
export class EmailHandler
  extends NotificationController {
  constructor() {
    super();
  }

  /** */
  constructMail(
    to: string,
    subject: string,
    text: string,
    html: string,
    from = 'info@eagleinfosolutions.com'
  ) {
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
          notificationsControllerLogger.error('email verication with token error',
            JSON.stringify(error));
          reject(error);
        });
    });
  }
}


/** */
export const constructMailService = (
  sendGridApiKey: string, publicKey: string, privateKey: string) => {
  sgMail.setApiKey(sendGridApiKey);

  // console.log(generateVAPIDKeys()); //generate key
  // console.log('those keys are', notifConfig);

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

/** create unregistered */
/** */
export const createNotifications = async(body): Promise<Isuccess> => {
  const options = body.options;
  const filters = body.filters;
  notificationsControllerLogger.info('createNotifications %body, %filters', body, filters);

  const notifMain = new mainnotificationMain(options);
  let errResponse: Isuccess;
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

  const subscriptions = await subscriptionLean
    .find({ active: true, ...filters })
    .lean();
  await ensureAllBulkNotifications(
        subscriptions as unknown as ISubscription[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [notifMain as unknown as any]
  );
  return { success: true, status: 200 };
};

/** */
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

/** */
export const sendAllNotifications = async(userLean) => {
  notificationsControllerLogger.info('sendAllNotifications');
  const all = await subscriptionLean
    .find({ active: true })
    .lean();
  await ensureAllBulkNotifications(
    userLean,
      all as unknown as ISubscription[]);
};

/** */
export const ensureAllBulkNotifications = async(
  userLean,
  subscriptions: ISubscription[],
  notifications?: IMainnotification[]
) => {
  const now = Date.now();
  const promises = subscriptions
    .map(async sub => {
      notificationsControllerLogger.debug('ensureAllBulkNotifications - subscriptions: ', sub);
      if (!notifications) {
        notifications = await mainnotificationLean
          .find({
            active: true
          })
          .gte('expireAt', now);
      }
      notifications
        .map(notif => {
          const payload = createPayload(
            notif.title,
            notif.body,
            notif.icon,
            notif.actions
          );
          sendLocalNotification(userLean, sub.subscription, payload);
        });
      return new Promise(resolve => {
        resolve(true);
      });
    });
  await Promise.all(promises);
};

/** */
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

/** */
export const sendLocalNotification = async(
  userLean,
  subscription, /** : webPush.PushSubscription //TODO */
  payload,
  options? /* : webPush.RequestOptions // TODO */
) => {
  notificationsControllerLogger.debug('sendLocalNotification - subscription', subscription);
  const isValid = verifyObjectId(subscription.userId);
  if (!isValid) {
    return;// Promise.resolve(false);
  }
  const user = await userLean
    .findById(subscription.userId).lean();
  webPush.sendNotification(
    subscription,
    JSON.stringify(payload),
    options
  ).then(res => {
    notificationsControllerLogger.debug('sendLocalNotification - res: ', res);
    if (user) {
      if (emailHandler.determineUserHasMail(user as Iuser)) {
        const mailOptions = emailHandler.constructMail(
          user.email,
          payload.title,
          payload.body,
          ''
        );
        emailHandler.sendMail(mailOptions);
      } else {
        smsHandler.sendSms(user.phone, user.countryCode, payload.body);
      }
    }
  }).catch(err => {
    notificationsControllerLogger.error('sendLocalNotification - err: ', err);
  });
};

/** */
export const updateNotifnViewed = async(user: Iauthtoken, id: string) => {
  notificationsControllerLogger.info('updateNotifnViewed - user: ', user);
  const { userId } = user;
  await mainnotificationMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .updateOne({ _id: id }, { $push: { viewed: userId } });
  return true;
};

/** */
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


