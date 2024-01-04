import { Schema, Model } from 'mongoose';
import { connectUniversalDatabase, isUniversalDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';
import { IfileMeta } from '@open-stock/stock-universal';

const uniqueValidator = require('mongoose-unique-validator');

const fileMetaSchema: Schema<IfileMeta> = new Schema({
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
export let fileMeta: Model<IfileMeta>;

/**
 * Represents the fileMetaLean variable.
 */
export let fileMetaLean: Model<IfileMeta>;

/**
 * Creates an file meta model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export const createFileMetaModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isUniversalDbConnected) {
    await connectUniversalDatabase(dbUrl);
  }

  if (main) {
    fileMeta = mainConnection.model<IfileMeta>('FileMeta', fileMetaSchema);
  }

  if (lean) {
    fileMetaLean = mainConnectionLean.model<IfileMeta>('FileMeta', fileMetaSchema);
  }
};
