"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrackViewModel = exports.trackViewSelect = exports.trackViewLean = exports.trackViewMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../controllers/database.controller");
const stock_universal_local_1 = require("../../stock-universal-local");
const uniqueValidator = require('mongoose-unique-validator');
/** subscription package schema */
const trackViewSchema = new mongoose_1.Schema({
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
 * Selects the trackViewselect constant from the trackView.model module.
 */
exports.trackViewSelect = trackViewselect;
/**
 * Creates a new subscription package model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
const createTrackViewModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isUniversalDbConnected) {
        await (0, stock_universal_local_1.connectUniversalDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.trackViewMain = database_controller_1.mainConnection.model('TrackView', trackViewSchema);
    }
    if (lean) {
        exports.trackViewLean = database_controller_1.mainConnectionLean.model('TrackView', trackViewSchema);
    }
};
exports.createTrackViewModel = createTrackViewModel;
//# sourceMappingURL=track-view.model.js.map