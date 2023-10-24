/**
 * @fileoverview This file contains the definition of the notification settings model.
 * @packageDocumentation
 */

import { Document, Schema, Model } from 'mongoose';
import { InotifSetting } from '@open-stock/stock-universal';
import { connectNotifDatabase, isNotifDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';

/** Model interface for notification settings */
export type TnotifSetting = Document & InotifSetting;

/** Schema definition for notification settings */
const notifSettingSchema: Schema = new Schema({
  invoices: { type: Boolean, default: true },
  payments: { type: Boolean, default: true },
  orders: { type: Boolean, default: true },
  jobCards: { type: Boolean, default: true },
  users: { type: Boolean, default: true }
}, { timestamps: true });

/** Primary selection object for notification settings */
const notifSettingselect = {
  invoices: 1,
  payments: 1,
  orders: 1,
  jobCards: 1,
  users: 1
};

/** Main connection for notification settings operations */
export let notifSettingMain: Model<TnotifSetting>;

/** Lean connection for notification settings operations */
export let notifSettingLean: Model<TnotifSetting>;

/** Primary selection object for notification */
export const notifSettingSelect = notifSettingselect;

/**
 * Creates the notification settings model.
 * @async
 * @param {string} dbUrl - The database URL.
 * @param {boolean} [main=true] - Whether to create the main connection.
 * @param {boolean} [lean=true] - Whether to create the lean connection.
 */
export const createNotifStnModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isNotifDbConnected) {
    await connectNotifDatabase(dbUrl);
  }

  if (main) {
    notifSettingMain = mainConnection.model<TnotifSetting>('NotifSetting', notifSettingSchema);
  }

  if (lean) {
    notifSettingLean = mainConnectionLean.model<TnotifSetting>('NotifSetting', notifSettingSchema);
  }
};
