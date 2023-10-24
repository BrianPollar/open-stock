import { Iactionwithall, Imainnotification, InotifSetting, Isuccess, TnotifType } from '@open-stock/stock-universal';
/** */
export declare class NotificationMain {
    _id: string;
    actions: Iactionwithall[];
    userId: string;
    title: string;
    body: string;
    icon: string;
    notifType: TnotifType;
    notifInvokerId: string;
    expireAt: string;
    createdAt: string;
    constructor(data: Imainnotification);
    /** */
    static creatNotifs(notif: Imainnotification): Promise<Isuccess>;
    /** */
    static getNotifications(url?: string, offset?: number, limit?: number): Promise<NotificationMain[]>;
    /** */
    static appendSubscription(subscription: PushSubscription): Promise<Isuccess>;
    /** */
    static getUnviewedLength(): Promise<number>;
    /** */
    static clearAll(): Promise<Isuccess>;
    updateViewed(): Promise<Isuccess>;
}
/** */
export declare class NotifSetting {
    invoices: boolean;
    payments: boolean;
    orders: boolean;
    jobCards: boolean;
    users: boolean;
    constructor(data: InotifSetting);
    static makeNotifnSettingDummy(): {
        invoices: boolean;
        payments: boolean;
        orders: boolean;
        jobCards: boolean;
        users: boolean;
    };
    /** */
    static getNotificationsSetting(): Promise<NotifSetting[]>;
    update(vals: InotifSetting): Promise<Isuccess>;
}
