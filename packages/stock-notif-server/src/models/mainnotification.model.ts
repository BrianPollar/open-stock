/**
 * @fileoverview This file contains the Mongoose schema and model for the main notification object.
 * @packageDocumentation
 */

import { Iactionwithall, TnotifType } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectNotifDatabase, isNotifDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';

/** Interface for the main notification object. */
export interface IMainnotification extends Document {

  /** Actions to be taken for the notification. */
  actions: Iactionwithall[];

  /** ID of the user who will receive the notification. */
  userId: string;

  /** Title of the notification. */
  title: string;

  /** Body of the notification. */
  body: string;

  /** Icon to be displayed with the notification. */
  icon: string;

  /** Expiration time of the notification in milliseconds. */
  expireAt: number;

  /** Type of the notification. */
  notifType: TnotifType;

  /** ID of the object that invoked the notification. */
  notifInvokerId: string;

  /** Whether the notification is active or not. */
  active: boolean;

  /** Array of user IDs who have viewed the notification. */
  viewed: string[];
}

/** Mongoose schema for the main notification object. */
const mainnotificationSchema: Schema<IMainnotification> = new Schema({
  actions: [{
    action: { type: String },
    title: { type: String },
    operation: { type: String },
    url: { type: String }
  }],
  userId: { type: String, required: [true, 'cannot be empty.'], index: true },
  title: { type: String, required: [true, 'cannot be empty.'] },
  body: { type: String, required: [true, 'cannot be empty.'] },
  icon: { type: String },
  expireAt: { type: Number, required: [true, 'cannot be empty.'] },
  notifType: { type: String, required: [true, 'cannot be empty.'] },
  notifInvokerId: { type: String },
  active: { type: Boolean, default: true },
  viewed: [] // strings of ObjectId
}, { timestamps: true });

mainnotificationSchema.index({ createdAt: -1 });

/** Index for the expiration time of the notification. */
mainnotificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });


/** Primary selection object for the main notification object. */
const mainNotifselect = {
  actions: 1,
  userId: 1,
  title: 1,
  body: 1,
  icon: 1,
  notifType: 1,
  notifInvokerId: 1,
  viewed: 1,
  active: 1,
  createdAt: 1
};

/**
 * Represents the main notification model.
 */
export let mainnotificationMain: Model<IMainnotification>;

/**
 * Represents the mainnotificationLean variable.
 */
export let mainnotificationLean: Model<IMainnotification>;

/**
 * Creates the Mongoose models for the main notification object.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main Mongoose model or not.
 * @param lean Whether to create the lean Mongoose model or not.
 */
export const createNotificationsModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isNotifDbConnected) {
    await connectNotifDatabase(dbUrl, dbOptions);
  }

  if (main) {
    mainnotificationMain = mainConnection.model<IMainnotification>('Mainnotification', mainnotificationSchema);
  }

  if (lean) {
    mainnotificationLean = mainConnectionLean.model<IMainnotification>('Mainnotification', mainnotificationSchema);
  }
};
