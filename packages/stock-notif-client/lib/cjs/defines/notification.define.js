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
     * @param companyId - The ID of the company
     * @param notif The notification to create.
     * @returns A promise that resolves to the success status of the operation.
     */
    static async creatNotifs(companyId, notif) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makePost(`/notification/create/${companyId}`, notif);
        return await (0, rxjs_1.lastValueFrom)(observer$);
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
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makeGet(`/notification/${url}/${offset}/${limit}/${companyId}`);
        const notifications = await (0, rxjs_1.lastValueFrom)(observer$);
        return notifications.map(val => new NotificationMain(val));
    }
    /**
     * Appends a subscription to the list of subscriptions.
     * @param companyId - The ID of the company
     * @param subscription The subscription to append.
     * @returns A promise that resolves to the success status of the operation.
     */
    static async appendSubscription(companyId, subscription) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makePost(`/notification/subscription/${companyId}`, { subscription });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Gets the number of unviewed notifications.
     * @param companyId - The ID of the company
     * @returns A promise that resolves to the number of unviewed notifications.
     */
    static async getUnviewedLength(companyId) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makeGet('/notification/unviewedlength');
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Clears all notifications.
     * @param companyId - The ID of the company
     * @returns A promise that resolves to the success status of the operation.
     */
    static async clearAll(companyId) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makePost(`/notification/clearall/${companyId}`, {});
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    /**
     * Updates the viewed status of the notification.
     * @param companyId - The ID of the company
     * @returns A promise that resolves to the success status of the operation.
     */
    async updateViewed(companyId) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makePost(`/notification/updateviewed/${companyId}`, { id: this._id });
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
     * @param companyId - The ID of the company
     * @returns A promise that resolves to an array of NotifSetting instances.
     */
    static async getNotificationsSetting(companyId) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makeGet(`/notification/getstn/${companyId}`);
        const stn = await (0, rxjs_1.lastValueFrom)(observer$);
        return stn.map(val => new NotifSetting(val));
    }
    /**
     * Updates the notification settings.
     * @param companyId - The ID of the company
     * @param vals The new values for the notification settings.
     * @returns A promise that resolves to the success status of the operation.
     */
    async update(companyId, vals) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp.makePut(`/notification/updatestn/${companyId}`, vals);
        return await (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.NotifSetting = NotifSetting;
//# sourceMappingURL=notification.define.js.map