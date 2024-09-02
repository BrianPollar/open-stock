import { Schema } from 'mongoose';
import { connectUniversalDatabase, stockUniversalConfig } from '../../stock-universal-local';
import { isUniversalDbConnected, mainConnection, mainConnectionLean } from '../../utils/database';
/** subscription package schema */
const trackDeletedSchema = new Schema({
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
export let trackDeletedMain;
/**
 * Represents a lean subscription package model.
 */
export let trackDeletedLean;
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
export const createTrackDeletedModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    trackDeletedSchema.index({ expireDocAfter: 1 }, { expireAfterSeconds: stockUniversalConfig.expireDocAfterSeconds });
    if (!isUniversalDbConnected) {
        await connectUniversalDatabase(dbUrl, dbOptions);
    }
    if (main) {
        trackDeletedMain = mainConnection.model('TrackDeleted', trackDeletedSchema);
    }
    if (lean) {
        trackDeletedLean = mainConnectionLean.model('TrackDeleted', trackDeletedSchema);
    }
};
//# sourceMappingURL=track-deleted.model.js.map