import { IuserWallet } from '@open-stock/stock-universal';
import { createExpireDocIndex, globalSchemaObj, globalSelectObj, preUpdateDocExpire } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../utils/database';

/**
 * Represents the Mongoose document type for a user wallet.
 * This type extends the `IuserWallet` interface, which defines the shape of a user wallet document.
 */
export type TuserWallet = Document & IuserWallet;

const userWalletSchema: Schema = new Schema({
  ...globalSchemaObj,
  user: { type: String, required: [true, 'cannot be empty.'], index: true },
  amount: { type: Number, required: [true, 'cannot be empty.'], index: true },
  type: { type: String }
}, { timestamps: true, collection: 'userwallets' });

userWalletSchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

userWalletSchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});

const userWalletselect = {
  ...globalSelectObj,
  user: 1,
  amount: 1,
  type: 1
};

/**
 * Represents the main Mongoose model for the user wallet.
 * This model is used for the main database connection and provides full CRUD functionality.
 */
export let userWalletMain: Model<TuserWallet>;

/**
 * Represents a lean Mongoose model for the user wallet.
 * This model is used for the main database connection and provides a lightweight, read-optimized version of the user wallet data.
 */
export let userWalletLean: Model<TuserWallet>;

export const userWalletSelect = userWalletselect;

/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
export const createUserWalletModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(userWalletSchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    userWalletMain = mainConnection.model<TuserWallet>('UserWallet', userWalletSchema);
  }

  if (lean) {
    userWalletLean = mainConnectionLean.model<TuserWallet>('UserWallet', userWalletSchema);
  }
};
