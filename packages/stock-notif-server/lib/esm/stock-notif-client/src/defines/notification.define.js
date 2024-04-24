/**
 * Defines classes for handling notifications and notification settings.
 * @packageDocumentation
 */
import { lastValueFrom } from 'rxjs';
import { StockNotifClient } from '../stock-notif-client';
/** Represents a main notification. */
export class NotificationMain {
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
     * @param companyId - The ID of the company
     * @param notif The notification to create.
     * @returns A promise that resolves to the success status of the operation.
     */
    static async creatNotifs(companyId, notif) {
        const observer$ = StockNotifClient.ehttp.makePost(`/notifn/create/${companyId}`, notif);
        return await lastValueFrom(observer$);
    }
    /**
     * Gets a list of notifications.
     * @param companyId - The ID of the company
     * @param url The URL to use for the request.
     * @param offset The offset to use for the request.
     * @param limit The limit to use for the request.
     * @returns A promise that resolves to an array of NotificationMain instances.
     */
    static async getNotifications(companyId, url = 'getmynotifn', offset = 0, limit = 20) {
        const observer$ = StockNotifClient.ehttp.makeGet(`/notifn/${url}/${offset}/${limit}/${companyId}`);
        const notifications = await lastValueFrom(observer$);
        return {
            count: notifications.count,
            notifications: notifications.data.map(val => new NotificationMain(val))
        };
    }
    /**
     * Appends a subscription to the list of subscriptions.
     * @param companyId - The ID of the company
     * @param subscription The subscription to append.
     * @returns A promise that resolves to the success status of the operation.
     */
    static async appendSubscription(companyId, subscription) {
        const observer$ = StockNotifClient.ehttp.makePost(`/notifn/subscription/${companyId}`, { subscription });
        return lastValueFrom(observer$);
    }
    /**
     * Gets the number of unviewed notifications.
     * @param companyId - The ID of the company
     * @returns A promise that resolves to the number of unviewed notifications.
     */
    static async getUnviewedLength(companyId) {
        const observer$ = StockNotifClient.ehttp.makeGet(`/notifn/unviewedlength/${companyId}`);
        return await lastValueFrom(observer$);
    }
    /**
     * Clears all notifications.
     * @param companyId - The ID of the company
     * @returns A promise that resolves to the success status of the operation.
     */
    static async clearAll(companyId) {
        const observer$ = StockNotifClient.ehttp.makePost(`/notifn/clearall/${companyId}`, {});
        return lastValueFrom(observer$);
    }
    /**
     * Updates the viewed status of the notification.
     * @param companyId - The ID of the company
     * @returns A promise that resolves to the success status of the operation.
     */
    async updateViewed(companyId) {
        const observer$ = StockNotifClient.ehttp.makePost(`/notifn/updateviewed/${companyId}`, { id: this._id });
        const response = await lastValueFrom(observer$);
        return response;
    }
}
/** Represents a notification setting. */
export class NotifSetting {
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
     * @param companyId - The ID of the company
     * @returns A promise that resolves to an array of NotifSetting instances.
     */
    static async getNotificationsSetting(companyId) {
        const observer$ = StockNotifClient.ehttp.makeGet(`/notifn/getstn/${companyId}`);
        const stn = await lastValueFrom(observer$);
        return stn.map(val => new NotifSetting(val));
    }
    /**
     * Updates the notification settings.
     * @param companyId - The ID of the company
     * @param vals The new values for the notification settings.
     * @returns A promise that resolves to the success status of the operation.
     */
    async update(companyId, vals) {
        const observer$ = StockNotifClient.ehttp.makePut(`/notifn/updatestn/${companyId}`, vals);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=notification.define.js.map