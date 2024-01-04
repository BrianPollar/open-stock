import { Schema, Document, Model } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';

/**
 * Represents a login attempt.
 */
export interface IloginAttempts extends Document {
  /**
   * The ID of the user attempting to login.
   */
  userId: string;
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

const loginAtempsSchema: Schema<IloginAttempts> = new Schema({
  userId: { type: String, index: true },
  ip: { type: String, index: true },
  successful: { type: Boolean, default: true }
}, { timestamps: true });


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
 * @param main Whether to create the main connection model.
 * @param lean Whether to create the lean connection model.
 */
export const createLoginAtemptsModel = async(dbUrl: string, main = true, lean = true) => {
  if (!isAuthDbConnected) {
    await connectAuthDatabase(dbUrl);
  }

  if (main) {
    loginAtempts = mainConnection.model<IloginAttempts>('loginAtempts', loginAtempsSchema);
  }

  if (lean) {
    loginAtemptsLean = mainConnectionLean.model<IloginAttempts>('loginAtempts', loginAtempsSchema);
  }
};

