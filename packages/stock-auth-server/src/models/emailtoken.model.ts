import { Schema, Document, Model } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';

/** */
const uniqueValidator = require('mongoose-unique-validator');

/** a bunch of email tokens sent to users */
/** */
export interface IEmailtoken extends Document {
  userId: string;
  token: string;
  updatedAt: string;
  createdAt: string;
}

const emailtokenSchema: Schema<IEmailtoken> = new Schema({
  userId: { type: String },
  token: { type: String, unique: true }
}, { timestamps: true });

// Apply the uniqueValidator plugin to emailtokenSchema.
emailtokenSchema.plugin(uniqueValidator);

export let emailtoken: Model<IEmailtoken>;
export let emailtokenLean: Model<IEmailtoken>;

/** */
/**
 * Creates an email token model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export const createEmailtokenModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isAuthDbConnected) {
    await connectAuthDatabase(dbUrl);
  }

  if (main) {
    emailtoken = mainConnection.model<IEmailtoken>('emailtoken', emailtokenSchema);
  }

  if (lean) {
    emailtokenLean = mainConnectionLean.model<IEmailtoken>('emailtoken', emailtokenSchema);
  }
};
