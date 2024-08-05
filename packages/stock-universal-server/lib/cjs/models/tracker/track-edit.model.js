"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrackEditModel = exports.trackEditSelect = exports.trackEditLean = exports.trackEditMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const stock_universal_local_1 = require("../../stock-universal-local");
const uniqueValidator = require('mongoose-unique-validator');
/** subscription package schema */
const trackEditSchema = new mongoose_1.Schema({
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
 * Selects the trackEditselect constant from the trackEdit.model module.
 */
exports.trackEditSelect = trackEditselect;
/**
 * Creates a new subscription package model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
const createTrackEditModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isUniversalDbConnected) {
        await (0, stock_universal_local_1.connectUniversalDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.trackEditMain = database_controller_1.mainConnection.model('TrackEdit', trackEditSchema);
    }
    if (lean) {
        exports.trackEditLean = database_controller_1.mainConnectionLean.model('TrackEdit', trackEditSchema);
    }
};
exports.createTrackEditModel = createTrackEditModel;
//# sourceMappingURL=track-edit.model.js.map