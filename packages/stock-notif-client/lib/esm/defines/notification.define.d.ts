/**
 * Defines classes for handling notifications and notification settings.
 * @packageDocumentation
 */
import { Iactionwithall, Imainnotification, InotifSetting, Isuccess, TnotifType } from '@open-stock/stock-universal';
/** Represents a main notification. */
export declare class NotificationMain {
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
    constructor(data: Imainnotification);
    /**
     * Creates a new notification.
  
     * @param notif The notification to create.
     * @returns A promise that resolves to the success status of the operation.
     */
    static create(notif: Imainnotification): Promise<Isuccess>;
    /**
     * Gets a list of notifications.
  
     * @param url The URL to use for the request.
     * @param offset The offset to use for the request.
     * @param limit The limit to use for the request.
     * @returns A promise that resolves to an array of NotificationMain instances.
     */
    static getAll(url?: string, offset?: number, limit?: number): Promise<{
        count: number;
        notifications: NotificationMain[];
    }>;
    /**
     * Appends a subscription to the list of subscriptions.
  
     * @param subscription The subscription to append.
     * @returns A promise that resolves to the success status of the operation.
     */
    static appendSubscription(subscription: PushSubscription | null): Promise<Isuccess>;
    /**
     * Gets the number of unviewed notifications.
  
     * @returns A promise that resolves to the number of unviewed notifications.
     */
    static getUnviewedLength(companyId: string): Promise<number>;
    /**
     * Clears all notifications.
  
     * @returns A promise that resolves to the success status of the operation.
     */
    static clearAll(companyId: string): Promise<Isuccess>;
    /**
     * Updates the viewed status of the notification.
  
     * @returns A promise that resolves to the success status of the operation.
     */
    updateViewed(companyId: string): Promise<Isuccess>;
}
/** Represents a notification setting. */
export declare class NotifSetting {
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
    constructor(data: InotifSetting);
    /**
     * Creates a dummy notification setting.
     * @returns A dummy notification setting.
     */
    static makeNotifnSettingDummy(): {
        invoices: boolean;
        payments: boolean;
        orders: boolean;
        jobCards: boolean;
        users: boolean;
    };
    /**
     * Gets the notification settings.
  
     * @returns A promise that resolves to an array of NotifSetting instances.
     */
    static getNotificationsSetting(companyId: string): Promise<NotifSetting[]>;
    /**
     * Updates the notification settings.
  
     * @param vals The new values for the notification settings.
     * @returns A promise that resolves to the success status of the operation.
     */
    update(vals: InotifSetting): Promise<Isuccess>;
}
