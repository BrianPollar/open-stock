import { Schema, Document, Model } from 'mongoose';
import { connectAuthDatabase, isAuthDbConnected, mainConnection, mainConnectionLean } from '../controllers/database.controller';

/** a bunch of email tokens sent to users */
/** */
export interface IloginAttempts extends Document {
  userId: string;
  ip: string;
  successful: boolean;
  updatedAt: string;
  createdAt: string;
}

const loginAtempsSchema: Schema<IloginAttempts> = new Schema({
  userId: { type: String, index: true },
  ip: { type: String, index: true },
  successful: { type: Boolean, default: true }
}, { timestamps: true });


export let loginAtempts: Model<IloginAttempts>;
export let loginAtemptsLean: Model<IloginAttempts>;

/** */
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
