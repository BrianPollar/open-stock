import { lastValueFrom } from 'rxjs';
import { StockNotifClient } from '../stock-notif-client';
/** */
export class NotificationMain {
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
    /** */
    static async creatNotifs(notif) {
        const observer$ = StockNotifClient.ehttp.makePost('/notification/create', notif);
        return await lastValueFrom(observer$);
    }
    /** */
    static async getNotifications(url = 'getmynotifn', offset = 0, limit = 0) {
        const observer$ = StockNotifClient.ehttp
            .makeGet(`/notification/${url}/${offset}/${limit}`);
        const notifications = await lastValueFrom(observer$);
        return notifications.map(val => new NotificationMain(val));
    }
    /** */
    static async appendSubscription(subscription) {
        const observer$ = StockNotifClient.ehttp
            .makePost('/notification/subscription', { subscription });
        return lastValueFrom(observer$);
    }
    /** */
    static async getUnviewedLength() {
        const observer$ = StockNotifClient.ehttp.makeGet('/notification/unviewedlength');
        return await lastValueFrom(observer$);
    }
    /** */
    static async clearAll() {
        const observer$ = StockNotifClient.ehttp
            .makePost('/notification/clearall', {});
        return lastValueFrom(observer$);
    }
    async updateViewed() {
        const observer$ = StockNotifClient.ehttp
            .makePost('/notification/updateviewed', { id: this._id });
        const response = await lastValueFrom(observer$);
        /** // TODO remove this somewhr else  if (response.success) {
          const foundIndex = this.dataService.notifications
            .findIndex(val => val._id === this._id);
          this.dataService.notifications.splice(foundIndex, 1);
        }*/
        return response;
    }
}
/** */
export class NotifSetting {
    constructor(data) {
        this.invoices = data.invoices;
        this.payments = data.payments;
        this.orders = data.orders;
        this.jobCards = data.jobCards;
        this.users = data.users;
    }
    static makeNotifnSettingDummy() {
        return {
            invoices: true,
            payments: true,
            orders: true,
            jobCards: true,
            users: true
        };
    }
    /** */
    static async getNotificationsSetting() {
        const observer$ = StockNotifClient.ehttp.makeGet('/notification/getstn');
        const stn = await lastValueFrom(observer$);
        return stn.map(val => new NotifSetting(val));
    }
    async update(vals) {
        const observer$ = StockNotifClient.ehttp.makePut('/notification/updatestn', vals);
        return await lastValueFrom(observer$);
    }
}
//# sourceMappingURL=notification.define.js.map