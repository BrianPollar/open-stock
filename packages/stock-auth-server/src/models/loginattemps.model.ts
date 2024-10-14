import { connectDatabase, isDbConnected, mainConnection, mainConnectionLean } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';

/**
 * Represents a login attempt.
 */
export interface IloginAttempts
extends Document {

  /**
   * The ID of the user attempting to login.
   */
  userId: string | Schema.Types.ObjectId;

  /**
   * The IP address from which the login attempt was made.
   */
  ip: string;

  /**
   * Indicates whether the login attempt was successful or not.
   */
  successful: boolean;

  /**
   * The date and time when the login attempt was last updated.
   */
  updatedAt: string;

  /**
   * The date and time when the login attempt was created.
   */
  createdAt: string;
}

const loginAtempsSchema: Schema<IloginAttempts> = new Schema<IloginAttempts>({
  userId: { type: Schema.Types.ObjectId, index: true },
  ip: { type: String, index: true },
  successful: { type: Boolean, default: true }
}, { timestamps: true, collection: 'loginatempts' });


/**
 * Represents the login attempts model.
 */
export let loginAtempts: Model<IloginAttempts>;

/**
 * Represents a variable that holds a lean model of login attempts.
 */
export let loginAtemptsLean: Model<IloginAttempts>;


/**
 * Creates a login attempts model with the given database URL.
 * @param dbUrl The URL of the database to connect to.
 * @param dbOptions The options passed to the database connection.
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createLoginAtemptsModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isDbConnected) {
    await connectDatabase(dbUrl, dbOptions);
  }

  if (main) {
    loginAtempts = mainConnection
      .model<IloginAttempts>('loginAtempts', loginAtempsSchema);
  }

  if (lean) {
    loginAtemptsLean = mainConnectionLean
      .model<IloginAttempts>('loginAtempts', loginAtempsSchema);
  }
};

