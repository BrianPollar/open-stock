import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const userWalletHistorySchema = new Schema({
    trackEdit: { type: Schema.ObjectId },
    trackView: { type: Schema.ObjectId },
    wallet: { type: String, index: true },
    amount: { type: String, required: [true, 'cannot be empty.'], index: true },
    type: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true });
const userWalletHistoryselect = {
    trackEdit: 1,
    trackView: 1,
    wallet: 1,
    amount: 1,
    type: 1
};
/**
 * Represents the main Mongoose model for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the main database connection.
 */
export let userWalletHistoryMain;
/**
 * Represents the lean Mongoose model for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the lean database connection, which provides a more optimized and efficient way of querying the data.
 */
export let userWalletHistoryLean;
export const userWalletHistorySelect = userWalletHistoryselect;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
export const createUserWalletHistoryModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        userWalletHistoryMain = mainConnection.model('UserWalletHistory', userWalletHistorySchema);
    }
    if (lean) {
        userWalletHistoryLean = mainConnectionLean.model('UserWalletHistory', userWalletHistorySchema);
    }
};
//# sourceMappingURL=user-wallet-history.model.js.map