import { connectDatabase, createExpireDocIndex, globalSchemaObj, globalSelectObj, isDbConnected, mainConnection, mainConnectionLean, preUpdateDocExpire } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const userWalletSchema = new Schema({
    ...globalSchemaObj,
    user: { type: Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
    accountBalance: {
        type: Number,
        required: [true, 'cannot be empty.'],
        index: true,
        default: 0,
        min: [0, 'cannot be less than 0.']
    },
    currency: { type: String }
}, { timestamps: true, collection: 'userwallets' });
userWalletSchema.pre('updateOne', function (next) {
    return preUpdateDocExpire(this, next);
});
userWalletSchema.pre('updateMany', function (next) {
    return preUpdateDocExpire(this, next);
});
const userWalletselect = {
    ...globalSelectObj,
    user: 1,
    accountBalance: 1,
    currency: 1
};
/**
 * Represents the main Mongoose model for the user wallet.
 * This model is used for the main database connection and provides full CRUD functionality.
 */
export let userWalletMain;
/**
 * Represents a lean Mongoose model for the user wallet.
 * This model is used for the main database connection and
 * provides a lightweight, read-optimized version of the user wallet data.
 */
export let userWalletLean;
export const userWalletSelect = userWalletselect;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
export const createUserWalletModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(userWalletSchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        userWalletMain = mainConnection
            .model('UserWallet', userWalletSchema);
    }
    if (lean) {
        userWalletLean = mainConnectionLean
            .model('UserWallet', userWalletSchema);
    }
};
//# sourceMappingURL=user-wallet.model.js.map