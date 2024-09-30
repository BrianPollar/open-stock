"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFileMetaModel = exports.fileMetaLean = exports.fileMeta = void 0;
const mongoose_1 = require("mongoose");
const database_1 = require("../utils/database");
const uniqueValidator = require('mongoose-unique-validator');
const fileMetaSchema = new mongoose_1.Schema({
    trackEdit: { type: mongoose_1.Schema.ObjectId },
    trackView: { type: mongoose_1.Schema.ObjectId },
    isDeleted: { type: Boolean, default: false },
    userOrCompanayId: { type: String },
    expireDocAfter: { type: Date, default: null },
    name: { type: String },
    url: { type: String },
    type: { type: String },
    size: { type: String },
    storageDir: { type: String },
    version: { type: String }
}, { timestamps: true, collection: 'filemetas' });
/* fileMetaSchema.index(
  { expireDocAfter: 1 },
  { expireAfterSeconds: stockUniversalConfig.expireDocAfterSeconds }
); */
// Apply the uniqueValidator plugin to fileMetaSchema.
fileMetaSchema.plugin(uniqueValidator);
/**
 * Creates an file meta model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
const createFileMetaModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_1.isUniversalDbConnected) {
        await (0, database_1.connectUniversalDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.fileMeta = database_1.mainConnection
            .model('FileMeta', fileMetaSchema);
    }
    if (lean) {
        exports.fileMetaLean = database_1.mainConnectionLean
            .model('FileMeta', fileMetaSchema);
    }
};
exports.createFileMetaModel = createFileMetaModel;
//# sourceMappingURL=filemeta.model.js.map