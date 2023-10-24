import { Document, Model } from 'mongoose';
import { InotifSetting } from '@open-stock/stock-universal';
/** model interface for notification settings by
 */
/** */
export type TnotifSetting = Document & InotifSetting;
/** main connection for notifications setting Operations*/
export declare let notifSettingMain: Model<TnotifSetting>;
/** lean connection for notifications setting Operations*/
export declare let notifSettingLean: Model<TnotifSetting>;
/** primary selection object
 * for notification
 */
/** */
export declare const notifSettingSelect: {
    invoices: number;
    payments: number;
    orders: number;
    jobCards: number;
    users: number;
};
/** */
export declare const createNotifStnModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
