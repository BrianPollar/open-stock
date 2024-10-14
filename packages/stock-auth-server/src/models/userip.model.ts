import {
  connectDatabase,
  isDbConnected, mainConnection,
  mainConnectionLean
} from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';

const uniqueValidator = require('mongoose-unique-validator');

/**
 * Represents a user IP model.
 */
export interface IUserip
extends Document {

  /**
   * The ID of the user or company.
   */
  userOrCompanayId: string | Schema.Types.ObjectId;

  /**
   * List of green IPs.
   */
  greenIps: string[];

  /**
   * List of red IPs.
   */
  redIps: string[];

  /**
   * List of unverified IPs.
   */
  unverifiedIps: string[];

  /**
   * Indicates if the user is blocked.
   */
  blocked;

  /**
   * The date and time when the user IP was last updated.
   */
  updatedAt: string;

  /**
   * The date and time when the user IP was created.
   */
  createdAt: string;
}

const useripSchema: Schema<IUserip> = new Schema<IUserip>({
  userOrCompanayId: { type: Schema.Types.ObjectId },
  greenIps: [],
  redIps: [],
  unverifiedIps: [],
  blocked: { }
}, { timestamps: true, collection: 'userips' });

// Apply the uniqueValidator plugin to useripSchema.
useripSchema.plugin(uniqueValidator);

/**
 * Represents the userip variable.
 */
export let userip: Model<IUserip>;

/**
 * Represents a lean user IP model.
 */
export let useripLean: Model<IUserip>;


/**
 * Creates an email token model with the given database URL, main flag, and lean flag.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main email token model.
 * @param lean Whether to create the lean email token model.
 */
export const createUseripModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    userip = mainConnection
      .model<IUserip>('userip', useripSchema);
  }

  if (lean) {
    useripLean = mainConnectionLean
      .model<IUserip>('userip', useripSchema);
  }
};

