/**
 * @fileoverview This file contains the definition of the notification settings model.
 * @packageDocumentation
 */

import { InotifSetting } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectNotifDatabase, isNotifDbConnected, mainConnection, mainConnectionLean } from '../utils/database';

/**
 * Represents the type for a notification setting.
 * Extends the Document interface and the InotifSetting interface.
 */
export type TnotifSetting = Document & InotifSetting;

/** Schema definition for notification settings */
const notifSettingSchema: Schema<TnotifSetting> = new Schema({
  companyId: { type: String },
  invoices: { type: Boolean, default: true },
  payments: { type: Boolean, default: true },
  orders: { type: Boolean, default: true },
  jobCards: { type: Boolean, default: true },
  users: { type: Boolean, default: true }
}, { timestamps: true, collection: 'notifsettings' });

/** Primary selection object for notification settings */
const notifSettingselect = {
  companyId: 1,
  invoices: 1,
  payments: 1,
  orders: 1,
  jobCards: 1,
  users: 1
};

/**
 * Represents the main notification setting model.
 */
export let notifSettingMain: Model<TnotifSetting>;

/**
 * Represents a variable that holds a lean model of a notification setting.
 */
export let notifSettingLean: Model<TnotifSetting>;

/**
 * Selects the notifSettingselect constant from the notifSetting model.
 */
export const notifSettingSelect = notifSettingselect;

/**
 * Creates the notification settings model.
 * @async
 * @param {string} dbUrl - The database URL.
 * @param {boolean} [main=true] - Whether to create the main connection.
 * @param {boolean} [lean=true] - Whether to create the lean connection.
 */
export const createNotifStnModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isNotifDbConnected) {
    await connectNotifDatabase(dbUrl, dbOptions);
  }

  if (main) {
    notifSettingMain = mainConnection
      .model<TnotifSetting>('NotifSetting', notifSettingSchema);
  }

  if (lean) {
    notifSettingLean = mainConnectionLean
      .model<TnotifSetting>('NotifSetting', notifSettingSchema);
  }
};
