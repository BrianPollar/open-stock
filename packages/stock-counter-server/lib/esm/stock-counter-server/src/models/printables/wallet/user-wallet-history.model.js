import { connectDatabase, createExpireDocIndex, globalSchemaObj, globalSelectObj, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const userWalletHistorySchema = new Schema({
    ...globalSchemaObj,
    wallet: { type: Schema.Types.ObjectId, index: true },
    amount: { type: Number, required: [true, 'cannot be empty.'], index: true },
    type: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true, collection: 'userwallethistories' });
userWalletHistorySchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
userWalletHistorySchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
const userWalletHistoryselect = {
    ...globalSelectObj,
    wallet: 1,
    amount: 1,
    type: 1
};
/**
 * Represents the main Mongoose
 * model for the user behaviour data, including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the main database connection.
 */
export let userWalletHistoryMain;
/**
 * Represents the lean Mongoose model for the user behaviour data,
 *  including recent activity, cart, wishlist, compare list, and search terms.
 * This model is used for the lean database connection, which
 * provides a more optimized and efficient way of querying the data.
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
    createExpireDocIndex(userWalletHistorySchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        userWalletHistoryMain = mainConnection
            .model('UserWalletHistory', userWalletHistorySchema);
    }
    if (lean) {
        userWalletHistoryLean = mainConnectionLean
            .model('UserWalletHistory', userWalletHistorySchema);
    }
};
//# sourceMappingURL=user-wallet-history.model.js.map