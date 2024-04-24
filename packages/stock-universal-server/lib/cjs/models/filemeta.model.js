"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFileMetaModel = exports.fileMetaLean = exports.fileMeta = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../controllers/database.controller");
const uniqueValidator = require('mongoose-unique-validator');
const fileMetaSchema = new mongoose_1.Schema({
    userOrCompanayId: { type: String },
    name: { type: String },
    url: { type: String },
    type: { type: String },
    size: { type: String },
    storageDir: { type: String },
    version: { type: String }
}, { timestamps: true });
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
    if (!database_controller_1.isUniversalDbConnected) {
        await (0, database_controller_1.connectUniversalDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.fileMeta = database_controller_1.mainConnection.model('FileMeta', fileMetaSchema);
    }
    if (lean) {
        exports.fileMetaLean = database_controller_1.mainConnectionLean.model('FileMeta', fileMetaSchema);
    }
};
exports.createFileMetaModel = createFileMetaModel;
//# sourceMappingURL=filemeta.model.js.map