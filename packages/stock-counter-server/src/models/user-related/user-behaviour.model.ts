/**
 * Defines the schema and models for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * The schema is defined with Mongoose and includes a unique validator plugin.
 * The `createReviewModel` function can be used to create the main and lean connection models for the user behaviour data.
 */
import { IuserBehaviour } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../controllers/database.controller';

/**
 * Represents the type of a user behaviour document in the database.
 * This type extends the `Document` type from Mongoose and the `IuserBehaviour` interface,
 * which likely defines the shape of a user behaviour document.
 */

export type TuserBehaviour = Document & IuserBehaviour;

const userBehaviourSchema: Schema = new Schema({
  trackEdit: { type: Schema.ObjectId },
  trackView: { type: Schema.ObjectId },
  user: { type: String, index: true },
  userCookieId: { type: String, required: [true, 'cannot be empty.'], index: true },
  recents: [],
  cart: [],
  wishList: [],
  compareList: [],
  searchTerms: [],
  expireAt: { type: String }
}, { timestamps: true });

userBehaviourSchema.index(
  { expireAt: 1 },
  { expireAfterSeconds: 7.884e+6 }
); // expire After 3 months

const userBehaviourselect = {
  trackEdit: 1,
  trackView: 1,
  user: 1,
  userCookieId: 1,
  recents: 1,
  cart: 1,
  wishList: 1,
  compareList: 1,
  searchTerms: 1
};

/**
 * Represents the main Mongoose model for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the main database connection.
 */
export let userBehaviourMain: Model<TuserBehaviour>;

/**
 * Represents the lean Mongoose model for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the lean database connection, which provides a more optimized and efficient way of querying the data.
 */
export let userBehaviourLean: Model<TuserBehaviour>;

export const userBehaviourSelect = userBehaviourselect;

/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
export const createUserBehaviourModel = async(dbUrl: string, dbOptions?: ConnectOptions, main = true, lean = true) => {
  if (!isStockDbConnected) {
    await connectStockDatabase(dbUrl, dbOptions);
  }

  if (main) {
    userBehaviourMain = mainConnection.model<TuserBehaviour>('UserBehaviour', userBehaviourSchema);
  }

  if (lean) {
    userBehaviourLean = mainConnectionLean.model<TuserBehaviour>('UserBehaviour', userBehaviourSchema);
  }
};
