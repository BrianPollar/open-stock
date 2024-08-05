import { Schema } from 'mongoose';
import { isUniversalDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
import { connectUniversalDatabase } from '../../stock-universal-local';
const uniqueValidator = require('mongoose-unique-validator');
/** subscription package schema */
const trackViewSchema = new Schema({
    parent: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    users: []
}, { timestamps: true });
// Apply the uniqueValidator plugin to trackViewSchema.
trackViewSchema.plugin(uniqueValidator);
/** Primary selection object for subscription package */
const trackViewselect = {
    parent: 1,
    users: 1
};
/**
 * Represents the main subscription package model.
 */
export let trackViewMain;
/**
 * Represents a lean subscription package model.
 */
export let trackViewLean;
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
export const createTrackViewModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isUniversalDbConnected) {
        await connectUniversalDatabase(dbUrl, dbOptions);
    }
    if (main) {
        trackViewMain = mainConnection.model('TrackView', trackViewSchema);
    }
    if (lean) {
        trackViewLean = mainConnectionLean.model('TrackView', trackViewSchema);
    }
};
//# sourceMappingURL=track-view.model.js.map