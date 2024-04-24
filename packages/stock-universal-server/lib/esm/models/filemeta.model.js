import { Schema } from 'mongoose';
import { connectUniversalDatabase, isUniversalDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
const uniqueValidator = require('mongoose-unique-validator');
const fileMetaSchema = new Schema({
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
 * Represents the fileMeta model.
 */
export let fileMeta;
/**
 * Represents the fileMetaLean variable.
 */
export let fileMetaLean;
/**
 * Creates an file meta model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export const createFileMetaModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isUniversalDbConnected) {
        await connectUniversalDatabase(dbUrl, dbOptions);
    }
    if (main) {
        fileMeta = mainConnection.model('FileMeta', fileMetaSchema);
    }
    if (lean) {
        fileMetaLean = mainConnectionLean.model('FileMeta', fileMetaSchema);
    }
};
//# sourceMappingURL=filemeta.model.js.map