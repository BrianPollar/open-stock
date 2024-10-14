import {
  connectDatabase, isDbConnected,
  mainConnection, mainConnectionLean
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';

const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents an email token.
 */
export interface IEmailtoken
extends Document {

  /**
   * The ID of the user associated with the token.
   */
  userId: string | Schema.Types.ObjectId;

  /**
   * The token value.
   */
  token: string;

  /**
   * The date and time when the token was last updated.
   */
  updatedAt: string;

  /**
   * The date and time when the token was created.
   */
  createdAt: string;
}

const emailtokenSchema: Schema<IEmailtoken> = new Schema<IEmailtoken>({
  userId: { type: Schema.Types.ObjectId },
  token: { type: String, unique: true }
}, { timestamps: true, collection: 'emailtokens' });

// Apply the uniqueValidator plugin to emailtokenSchema.
emailtokenSchema.plugin(uniqueValidator);

/**
 * Represents the email token model.
 */
export let emailtoken: Model<IEmailtoken>;

/**
 * Represents a lean version of the email token model.
 */
export let emailtokenLean: Model<IEmailtoken>;


/**
 * Creates an email token model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export const createEmailtokenModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    emailtoken = mainConnection
      .model<IEmailtoken>('emailtoken', emailtokenSchema);
  }

  if (lean) {
    emailtokenLean = mainConnectionLean
      .model<IEmailtoken>('emailtoken', emailtokenSchema);
  }
};
