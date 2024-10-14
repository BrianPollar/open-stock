import { connectDatabase, createExpireDocIndex, isDbConnected, mainConnection, mainConnectionLean } from '@open-stock/stock-universal-server';
import { Schema } from 'mongoose';
const waitingWalletPaySchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
    walletId: { type: Schema.Types.ObjectId, required: [true, 'can not be epmty'] },
    amount: {
        type: Number,
        required: [true, 'cannot be empty.'],
        index: true,
        min: [0, 'cannot be less than 0.']
    }
}, { timestamps: true, collection: 'userwallets' });
waitingWalletPaySchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
/**
 * Represents the main Mongoose model for the user wallet.
 * This model is used for the main database connection and provides full CRUD functionality.
 */
export let waitingWalletPayMain;
/**
 * Represents a lean Mongoose model for the user wallet.
 * This model is used for the main database connection and
 * provides a lightweight, read-optimized version of the user wallet data.
 */
export let waitingWalletPayLean;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
export const createWaitingWalletPaytModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    createExpireDocIndex(waitingWalletPaySchema);
    if (!isDbConnected) {
        await connectDatabase(dbUrl, dbOptions);
    }
    if (main) {
        waitingWalletPayMain = mainConnection
            .model('WaitingWalletPaySchema', waitingWalletPaySchema);
    }
    if (lean) {
        waitingWalletPayLean = mainConnectionLean
            .model('WaitingWalletPaySchema', waitingWalletPaySchema);
    }
};
//# sourceMappingURL=waiting-wallet-pay.model.js.map