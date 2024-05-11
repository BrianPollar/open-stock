/**
 * @fileoverview This file contains the definition of the notification settings model.
 * @packageDocumentation
 */
import { InotifSetting } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
/**
 * Represents the type for a notification setting.
 * Extends the Document interface and the InotifSetting interface.
 */
export type TnotifSetting = Document & InotifSetting;
/**
 * Represents the main notification setting model.
 */
export declare let notifSettingMain: Model<TnotifSetting>;
/**
 * Represents a variable that holds a lean model of a notification setting.
 */
export declare let notifSettingLean: Model<TnotifSetting>;
/**
 * Selects the notifSettingselect constant from the notifSetting model.
 */
export declare const notifSettingSelect: {
    companyId: number;
    invoices: number;
    payments: number;
    orders: number;
    jobCards: number;
    users: number;
};
/**
 * Creates the notification settings model.
 * @async
 * @param {string} dbUrl - The database URL.
 * @param {boolean} [main=true] - Whether to create the main connection.
 * @param {boolean} [lean=true] - Whether to create the lean connection.
 */
export declare const createNotifStnModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
