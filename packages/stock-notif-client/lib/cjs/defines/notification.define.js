"use strict";
/**
 * Defines classes for handling notifications and notification settings.
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifSetting = exports.NotificationMain = void 0;
const rxjs_1 = require("rxjs");
const stock_notif_client_1 = require("../stock-notif-client");
/** Represents a main notification. */
class NotificationMain {
    /**
     * Creates a new instance of NotificationMain.
     * @param data The data to initialize the instance with.
     */
    constructor(data) {
        this._id = data._id;
        this.actions = data.actions;
        this.userId = data.userId;
        this.title = data.title;
        this.body = data.body;
        this.icon = data.icon;
        this.notifType = data.notifType;
        this.notifInvokerId = data.notifInvokerId;
        this.expireAt = data.expireAt;
        this.createdAt = data.createdAt;
    }
    /**
     * Creates a new notification.
  
     * @param notif The notification to create.
     * @returns A promise that resolves to the success status of the operation.
     */
    static create(notif) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makePost('/notifn/create', notif);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Gets a list of notifications.
  
     * @param url The URL to use for the request.
     * @param offset The offset to use for the request.
     * @param limit The limit to use for the request.
     * @returns A promise that resolves to an array of NotificationMain instances.
     */
    static async getAll(url = 'getmynotifn', offset = 0, limit = 20) {
        const observer$ = stock_notif_client_1.StockNotifClient
            .ehttp.makeGet(`/notifn/${url}/${offset}/${limit}`);
        const notifications = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: notifications.count,
            notifications: notifications.data.map(val => new NotificationMain(val))
        };
    }
    /**
     * Appends a subscription to the list of subscriptions.
  
     * @param subscription The subscription to append.
     * @returns A promise that resolves to the success status of the operation.
     */
    static appendSubscription(subscription) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makePost('/notifn/subscription', { subscription });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Gets the number of unviewed notifications.
  
     * @returns A promise that resolves to the number of unviewed notifications.
     */
    static getUnviewedLength() {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makeGet('/notifn/unviewedlength');
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Clears all notifications.
  
     * @returns A promise that resolves to the success status of the operation.
     */
    static clearAll() {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makePost('/notifn/clearall', {});
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates the viewed status of the notification.
  
     * @returns A promise that resolves to the success status of the operation.
     */
    async updateViewed() {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makePost('/notifn/updateviewed', { id: this._id });
        const response = await (0, rxjs_1.lastValueFrom)(observer$);
        return response;
    }
}
exports.NotificationMain = NotificationMain;
/** Represents a notification setting. */
class NotifSetting {
    /**
     * Creates a new instance of NotifSetting.
     * @param data The data to initialize the instance with.
     */
    constructor(data) {
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
    static async getNotificationsSetting() {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makeGet('/notifn/getstn');
        const stn = await (0, rxjs_1.lastValueFrom)(observer$);
        return stn.map(val => new NotifSetting(val));
    }
    /**
     * Updates the notification settings.
  
     * @param vals The new values for the notification settings.
     * @returns A promise that resolves to the success status of the operation.
     */
    update(vals) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makePut('/notifn/updatestn', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.NotifSetting = NotifSetting;
//# sourceMappingURL=notification.define.js.map