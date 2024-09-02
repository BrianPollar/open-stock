/**
 * Defines the schema and models for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * The schema is defined with Mongoose and includes a unique validator plugin.
 * The `createReviewModel` function can be used to create the main and lean connection models for the user behaviour data.
 */
import { IwalletHistory } from '@open-stock/stock-universal';
import { createExpireDocIndex, globalSchemaObj, globalSelectObj, preUpdateDocExpire } from '@open-stock/stock-universal-server';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../utils/database';

/**
 * Represents the type of a user behaviour document in the database.
 * This type extends the `Document` type from Mongoose and the `IuserWalletHistory` interface,
 * which likely defines the shape of a user behaviour document.
 */

export type TuserWalletHistory = Document & IwalletHistory;

const userWalletHistorySchema: Schema = new Schema({
  ...globalSchemaObj,
  wallet: { type: String, index: true },
  amount: { type: String, required: [true, 'cannot be empty.'], index: true },
  type: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true, collection: 'userwallethistories' });

userWalletHistorySchema.pre('updateOne', function(next) {
  return preUpdateDocExpire(this, next);
});

userWalletHistorySchema.pre('updateMany', function(next) {
  return preUpdateDocExpire(this, next);
});

const userWalletHistoryselect = {
  ...globalSelectObj,
  wallet: 1,
  amount: 1,
  type: 1
};

/**
 * Represents the main Mongoose model for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the main database connection.
 */
export let userWalletHistoryMain: Model<TuserWalletHistory>;

/**
 * Represents the lean Mongoose model for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the lean database connection, which provides a more optimized and efficient way of querying the data.
 */
export let userWalletHistoryLean: Model<TuserWalletHistory>;

export const userWalletHistorySelect = userWalletHistoryselect;

/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
export const createUserWalletHistoryModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  createExpireDocIndex(userWalletHistorySchema);
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    userWalletHistoryMain = mainConnection.model<TuserWalletHistory>('UserWalletHistory', userWalletHistorySchema);
  }

  if (lean) {
    userWalletHistoryLean = mainConnectionLean.model<TuserWalletHistory>('UserWalletHistory', userWalletHistorySchema);
  }
};
