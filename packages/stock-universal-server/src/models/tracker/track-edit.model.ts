import { ItrackEdit } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectUniversalDatabase, stockUniversalConfig } from '../../stock-universal-local';
import { isUniversalDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';

export type TtrackEdit = Document & ItrackEdit;

/** subscription package schema */
const trackEditSchema: Schema = new Schema({
  parent: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  createdBy: { type: String, index: true },
  users: [],
  deletedBy: { type: String, index: true },
  collectionName: { type: String },
  expireDocAfter: { type: Date, default: null }
}, { timestamps: true, collection: 'trackedits' });

/** Primary selection object for subscription package */
const trackEditselect = {
  parent: 1,
  createdBy: 1,
  users: 1,
  deletedBy: 1,
  collectionName: 1
};

/**
 * Represents the main subscription package model.
 */
export let trackEditMain: Model<TtrackEdit>;

/**
 * Represents a lean subscription package model.
 */
export let trackEditLean: Model<TtrackEdit>;

/**
 * Selects the trackEditselect constant from the trackEdit.model module.
 */
export const trackEditSelect = trackEditselect;

/**
 * Creates a new subscription package model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createTrackEditModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  trackEditSchema.index(
    { expireDocAfter: 1 },
    { expireAfterSeconds: stockUniversalConfig.expireDocAfterSeconds }
  );
  if (!isUniversalDbConnected) {
    await connectUniversalDatabase(dbUrl, dbOptions);
  }

  if (main) {
    trackEditMain = mainConnection
      .model('TrackEdit', trackEditSchema) as Model<TtrackEdit>;
  }

  if (lean) {
    trackEditLean = mainConnectionLean
      .model('TrackEdit', trackEditSchema) as Model<TtrackEdit>;
  }
};
