import { Document, Model } from 'mongoose';
import { Iactionwithall, TnotifType } from '@open-stock/stock-universal';
/** model interface for notification by*/
/** */
export interface IMainnotification extends Document {
    actions: Iactionwithall[];
    userId: string;
    title: string;
    body: string;
    icon: string;
    expireAt: number;
    notifType: TnotifType;
    notifInvokerId: string;
    active: boolean;
    viewed: string[];
}
/** main connection for notifications Operations*/
export declare let mainnotificationMain: Model<IMainnotification>;
/** lean connection for notifications Operations*/
export declare let mainnotificationLean: Model<IMainnotification>;
/** primary selection object
 * for notification
 */
/** */
export declare const mainNotifSelect: {
    actions: number;
    userId: number;
    title: number;
    body: number;
    icon: number;
    notifType: number;
    notifInvokerId: number;
    viewed: number;
    active: number;
    createdAt: number;
};
/** */
export declare const createNotificationsModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
