import { ItrackDeleted } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectUniversalDatabase, stockUniversalConfig } from '../../stock-universal-local';
import { isUniversalDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';

export type TtrackDeleted = Document & ItrackDeleted;

/** subscription package schema */
const trackDeletedSchema: Schema = new Schema({
  parent: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
  deletedAt: { type: String, index: true },
  expireDocAfter: { type: Date, default: null },
  collectionName: { type: String }
}, { collection: 'trackdeleteds' });


/** Primary selection object for subscription package */
const trackDeletedselect = {
  parent: 1,
  deletedAt: 1,
  collectionName: 1
};

/**
 * Represents the main subscription package model.
 */
export let trackDeletedMain: Model<TtrackDeleted>;

/**
 * Represents a lean subscription package model.
 */
export let trackDeletedLean: Model<TtrackDeleted>;

/**
 * Selects the trackDeletedselect constant from the trackDeleted.model module.
 */
export const trackDeletedSelect = trackDeletedselect;

/**
 * Creates a new subscription package model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
export const createTrackDeletedModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  trackDeletedSchema.index(
    { expireDocAfter: 1 },
    { expireAfterSeconds: stockUniversalConfig.expireDocAfterSeconds }
  );
  if (!isUniversalDbConnected) {
    await connectUniversalDatabase(dbUrl, dbOptions);
  }

  if (main) {
    trackDeletedMain = mainConnection.model('TrackDeleted', trackDeletedSchema) as Model<TtrackDeleted>;
  }

  if (lean) {
    trackDeletedLean = mainConnectionLean.model('TrackDeleted', trackDeletedSchema) as Model<TtrackDeleted>;
  }
};
