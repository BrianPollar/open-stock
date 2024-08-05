import { Schema } from 'mongoose';
import { isUniversalDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';
import { connectUniversalDatabase } from '../../stock-universal-local';
const uniqueValidator = require('mongoose-unique-validator');
/** subscription package schema */
const trackEditSchema = new Schema({
    parent: { type: String, unique: true, required: [true, 'cannot be empty.'], index: true },
    createdBy: { type: String, required: [true, 'cannot be empty.'], index: true },
    users: [],
    deletedBy: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });
// Apply the uniqueValidator plugin to trackEditSchema.
trackEditSchema.plugin(uniqueValidator);
/** Primary selection object for subscription package */
const trackEditselect = {
    parent: 1,
    createdBy: 1,
    users: 1,
    deletedBy: 1
};
/**
 * Represents the main subscription package model.
 */
export let trackEditMain;
/**
 * Represents a lean subscription package model.
 */
export let trackEditLean;
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
export const createTrackEditModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isUniversalDbConnected) {
        await connectUniversalDatabase(dbUrl, dbOptions);
    }
    if (main) {
        trackEditMain = mainConnection.model('TrackEdit', trackEditSchema);
    }
    if (lean) {
        trackEditLean = mainConnectionLean.model('TrackEdit', trackEditSchema);
    }
};
//# sourceMappingURL=track-edit.model.js.map