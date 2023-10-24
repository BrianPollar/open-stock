import { ISubscription } from '../models/subscriptions.model';
import { Iaction, Iactionwithall, Iauthtoken, InotifSetting, Isuccess, Iuser, TnotifType } from '@open-stock/stock-universal';
import { IMainnotification } from '../models/mainnotification.model';
/** */
export declare class NotificationController {
    /** */
    stn: InotifSetting;
    /** */
    dispatchSinceOpen: number;
    /** */
    smsDispatches: number;
    /** */
    mailDispatches: number;
    /** */
    constructor();
    /** */
    determineUserHasMail(user: Iuser): boolean;
    /** */
    createSettings(): Promise<void>;
}
/** */
export declare class SmsHandler extends NotificationController {
    authy: any;
    twilioClient: any;
    twilioNumber: string | number;
    /** */
    email: string;
    /** */
    constructor(authy: any, twilioClient: any, twilioNumber: string | number);
    /** */
    setUpUser(phone: string | number, countryCode: string | number): Promise<unknown>;
    /** */
    sendToken(authyId: string): Promise<unknown>;
    /** */
    sendSms(phone: string, countryCode: string, message: string): Promise<unknown>;
}
/** */
export declare class EmailHandler extends NotificationController {
    constructor();
    /** */
    constructMail(to: string, subject: string, text: string, html: string, from?: string): {
        from: string;
        to: string;
        subject: string;
        text: string;
        html: string;
    };
    /** */
    sendMail(mailOptions: any): Promise<unknown>;
}
/** */
export declare const constructMailService: (sendGridApiKey: string, publicKey: string, privateKey: string) => void;
/** create unregistered */
/** */
export declare const createNotifications: (body: any) => Promise<Isuccess>;
/** */
export declare const createNotifSetting: (stn: any) => Promise<Isuccess>;
/** */
export declare const sendAllNotifications: (userLean: any) => Promise<void>;
/** */
export declare const ensureAllBulkNotifications: (userLean: any, subscriptions: ISubscription[], notifications?: IMainnotification[]) => Promise<void>;
/** */
export declare const createPayload: (title: string, body: string, icon: string, actions?: Iactionwithall[]) => {
    notification: {
        title: string;
        body: string;
        icon: string;
        duplicateActions: Iaction[];
        data: {
            onActionClick: {
                default: {
                    operation: string;
                };
            };
        };
    };
};
/** */
export declare const sendLocalNotification: (userLean: any, subscription: any, payload: any, options?: any) => Promise<void>;
/** */
export declare const updateNotifnViewed: (user: Iauthtoken, id: string) => Promise<boolean>;
/** */
export declare const makeNotfnBody: (userId: string, title: string, body: string, notifType: TnotifType, actions: Iactionwithall[], notifInvokerId: string) => {
    actions: Iactionwithall[];
    userId: string;
    title: string;
    notifType: TnotifType;
    notifInvokerId: string;
    body: string;
    icon: string;
    expireAt: number;
    orders: boolean;
    payments: boolean;
    users: boolean;
    items: boolean;
    faqs: boolean;
    buyer: boolean;
    viewed: any[];
};
