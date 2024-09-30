/**
 * Defines classes for handling notifications and notification settings.
 * @packageDocumentation
 */

import {
  Iactionwithall, IdataArrayResponse, Imainnotification, InotifSetting, Isuccess, TnotifType
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockNotifClient } from '../stock-notif-client';

/** Represents a main notification. */
export class NotificationMain {
  /** The ID of the notification. */

  _id: string;

  /** An array of actions associated with the notification. */
  actions: Iactionwithall[];

  /** The ID of the user who received the notification. */
  userId: string;

  /** The title of the notification. */
  title: string;

  /** The body of the notification. */
  body: string;

  /** The icon associated with the notification. */
  icon: string;

  /** The type of the notification. */
  notifType: TnotifType;

  /** The ID of the invoker of the notification. */
  notifInvokerId: string;

  /** The expiration date of the notification. */
  expireAt: string;

  /** The creation date of the notification. */
  createdAt: string;

  /**
   * Creates a new instance of NotificationMain.
   * @param data The data to initialize the instance with.
   */
  constructor(data: Imainnotification) {
    this._id = data._id ;
    this.actions = data.actions;
    this.userId = data.userId;
    this.title = data.title;
    this.body = data.body;
    this.icon = data.icon;
    this.notifType = data.notifType ;
    this.notifInvokerId = data.notifInvokerId ;
    this.expireAt = data.expireAt ;
    this.createdAt = data.createdAt ;
  }

  /**
   * Creates a new notification.

   * @param notif The notification to create.
   * @returns A promise that resolves to the success status of the operation.
   */
  static create(notif: Imainnotification) {
    const observer$ = StockNotifClient.ehttp.makePost<Isuccess>('/notifn/create', notif);

    return lastValueFrom(observer$);
  }

  /**
   * Gets a list of notifications.

   * @param url The URL to use for the request.
   * @param offset The offset to use for the request.
   * @param limit The limit to use for the request.
   * @returns A promise that resolves to an array of NotificationMain instances.
   */
  static async getAll(url = 'getmynotifn', offset = 0, limit = 20) {
    const observer$ = StockNotifClient
      .ehttp.makeGet<IdataArrayResponse<Imainnotification>>(`/notifn/${url}/${offset}/${limit}`);
    const notifications = await lastValueFrom(observer$);

    return {
      count: notifications.count,
      notifications: notifications.data.map(val => new NotificationMain(val)) };
  }

  /**
   * Appends a subscription to the list of subscriptions.

   * @param subscription The subscription to append.
   * @returns A promise that resolves to the success status of the operation.
   */
  static appendSubscription(subscription: PushSubscription | null) {
    const observer$ = StockNotifClient.ehttp.makePost<Isuccess>('/notifn/subscription', { subscription });

    return lastValueFrom(observer$);
  }

  /**
   * Gets the number of unviewed notifications.

   * @returns A promise that resolves to the number of unviewed notifications.
   */
  static getUnviewedLength(companyId: string) {
    const observer$ = StockNotifClient.ehttp.makeGet<number>('/notifn/unviewedlength');

    return lastValueFrom(observer$);
  }

  /**
   * Clears all notifications.

   * @returns A promise that resolves to the success status of the operation.
   */
  static clearAll(companyId: string) {
    const observer$ = StockNotifClient.ehttp.makePost<Isuccess>('/notifn/clearall', {});

    return lastValueFrom(observer$) ;
  }

  /**
   * Updates the viewed status of the notification.

   * @returns A promise that resolves to the success status of the operation.
   */
  async updateViewed(companyId: string) {
    const observer$ = StockNotifClient.ehttp.makePost<Isuccess>('/notifn/updateviewed', { id: this._id });
    const response = await lastValueFrom(observer$);

    return response;
  }
}

/** Represents a notification setting. */
export class NotifSetting {
  /** Whether to receive notifications for invoices. */
  invoices: boolean;

  /** Whether to receive notifications for payments. */
  payments: boolean;

  /** Whether to receive notifications for orders. */
  orders: boolean;

  /** Whether to receive notifications for job cards. */
  jobCards: boolean;

  /** Whether to receive notifications for users. */
  users: boolean;

  /**
   * Creates a new instance of NotifSetting.
   * @param data The data to initialize the instance with.
   */
  constructor(data: InotifSetting) {
    this.invoices = data.invoices;
    this.payments = data.payments;
    this.orders = data.orders;
    this.jobCards = data.jobCards;
    this.users = data.users;
  }

  /**
   * Creates a dummy notification setting.
   * @returns A dummy notification setting.
   */
  static makeNotifnSettingDummy() {
    return {
      invoices: true,
      payments: true,
      orders: true,
      jobCards: true,
      users: true
    };
  }

  /**
   * Gets the notification settings.

   * @returns A promise that resolves to an array of NotifSetting instances.
   */
  static async getNotificationsSetting(companyId: string) {
    const observer$ = StockNotifClient.ehttp.makeGet<InotifSetting[]>('/notifn/getstn');
    const stn = await lastValueFrom(observer$);

    return stn.map(val => new NotifSetting(val));
  }

  /**
   * Updates the notification settings.

   * @param vals The new values for the notification settings.
   * @returns A promise that resolves to the success status of the operation.
   */
  update(vals: InotifSetting) {
    const observer$ = StockNotifClient.ehttp.makePut<Isuccess>('/notifn/updatestn', vals);

    return lastValueFrom(observer$);
  }
}
