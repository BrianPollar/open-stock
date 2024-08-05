import { Schema } from 'mongoose';
import { connectStockDatabase, isStockDbConnected, mainConnection, mainConnectionLean } from '../../../controllers/database.controller';
const userWalletSchema = new Schema({
    trackEdit: { type: Schema.ObjectId },
    trackView: { type: Schema.ObjectId },
    user: { type: String, required: [true, 'cannot be empty.'], index: true },
    amount: { type: Number, required: [true, 'cannot be empty.'], index: true },
    type: { type: String }
}, { timestamps: true });
const userWalletselect = {
    trackEdit: 1,
    trackView: 1,
    user: 1,
    amount: 1,
    type: 1
};
/**
 * Represents the main Mongoose model for the user wallet.
 * This model is used for the main database connection and provides full CRUD functionality.
 */
export let userWalletMain;
/**
 * Represents a lean Mongoose model for the user wallet.
 * This model is used for the main database connection and provides a lightweight, read-optimized version of the user wallet data.
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
    if (!isStockDbConnected) {
        await connectStockDatabase(dbUrl, dbOptions);
    }
    if (main) {
        userWalletMain = mainConnection.model('UserWallet', userWalletSchema);
    }
    if (lean) {
        userWalletLean = mainConnectionLean.model('UserWallet', userWalletSchema);
    }
};
//# sourceMappingURL=user-wallet.model.js.map