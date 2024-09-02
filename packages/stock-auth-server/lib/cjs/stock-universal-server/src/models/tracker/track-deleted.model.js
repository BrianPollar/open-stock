"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrackDeletedModel = exports.trackDeletedSelect = exports.trackDeletedLean = exports.trackDeletedMain = void 0;
const mongoose_1 = require("mongoose");
const stock_universal_local_1 = require("../../stock-universal-local");
const database_1 = require("../../utils/database");
/** subscription package schema */
const trackDeletedSchema = new mongoose_1.Schema({
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
 * Selects the trackDeletedselect constant from the trackDeleted.model module.
 */
exports.trackDeletedSelect = trackDeletedselect;
/**
 * Creates a new subscription package model.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create a main connection.
 * @param lean Whether to create a lean connection.
 */
const createTrackDeletedModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    trackDeletedSchema.index({ expireDocAfter: 1 }, { expireAfterSeconds: stock_universal_local_1.stockUniversalConfig.expireDocAfterSeconds });
    if (!database_1.isUniversalDbConnected) {
        await (0, stock_universal_local_1.connectUniversalDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.trackDeletedMain = database_1.mainConnection.model('TrackDeleted', trackDeletedSchema);
    }
    if (lean) {
        exports.trackDeletedLean = database_1.mainConnectionLean.model('TrackDeleted', trackDeletedSchema);
    }
};
exports.createTrackDeletedModel = createTrackDeletedModel;
//# sourceMappingURL=track-deleted.model.js.map