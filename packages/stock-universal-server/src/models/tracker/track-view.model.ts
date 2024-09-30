import { ItrackView } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectUniversalDatabase, stockUniversalConfig } from '../../stock-universal-local';
import { isUniversalDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';

export type TtrackView = Document & ItrackView;

/** subscription package schema */
const trackViewSchema: Schema = new Schema<TtrackView>({
  parent: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  users: [],
  collectionName: { type: String },
  expireDocAfter: { type: Date, default: null }
}, { timestamps: true, collection: 'trackviews' });

/** Primary selection object for subscription package */
const trackViewselect = {
  parent: 1,
  users: 1,
  collectionName: 1
};

/**
 * Represents the main subscription package model.
 */
export let trackViewMain: Model<TtrackView>;

/**
 * Represents a lean subscription package model.
 */
export let trackViewLean: Model<TtrackView>;

/**
 * Selects the trackViewselect constant from the trackView.model module.
 */
export const trackViewSelect = trackViewselect;

/**
 * Creates a new subscription package model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createTrackViewModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  trackViewSchema.index(
    { expireDocAfter: 1 },
    { expireAfterSeconds: stockUniversalConfig.expireDocAfterSeconds }
  );
  if (!isUniversalDbConnected) {
    await connectUniversalDatabase(dbUrl, dbOptions);
  }

  if (main) {
    trackViewMain = mainConnection
      .model('TrackView', trackViewSchema) as Model<TtrackView>;
  }

  if (lean) {
    trackViewLean = mainConnectionLean
      .model('TrackView', trackViewSchema) as Model<TtrackView>;
  }
};
