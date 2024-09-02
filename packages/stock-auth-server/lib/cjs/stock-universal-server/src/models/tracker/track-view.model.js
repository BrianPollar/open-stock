"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrackViewModel = exports.trackViewSelect = exports.trackViewLean = exports.trackViewMain = void 0;
const mongoose_1 = require("mongoose");
const stock_universal_local_1 = require("../../stock-universal-local");
const database_1 = require("../../utils/database");
/** subscription package schema */
const trackViewSchema = new mongoose_1.Schema({
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
    trackViewSchema.index({ expireDocAfter: 1 }, { expireAfterSeconds: stock_universal_local_1.stockUniversalConfig.expireDocAfterSeconds });
    if (!database_1.isUniversalDbConnected) {
        await (0, stock_universal_local_1.connectUniversalDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.trackViewMain = database_1.mainConnection.model('TrackView', trackViewSchema);
    }
    if (lean) {
        exports.trackViewLean = database_1.mainConnectionLean.model('TrackView', trackViewSchema);
    }
};
exports.createTrackViewModel = createTrackViewModel;
//# sourceMappingURL=track-view.model.js.map