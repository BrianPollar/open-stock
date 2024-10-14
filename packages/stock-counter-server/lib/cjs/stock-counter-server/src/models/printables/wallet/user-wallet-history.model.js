"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserWalletHistoryModel = exports.userWalletHistorySelect = exports.userWalletHistoryLean = exports.userWalletHistoryMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const userWalletHistorySchema = new mongoose_1.Schema({
    ...stock_universal_server_1.globalSchemaObj,
    wallet: { type: mongoose_1.Schema.Types.ObjectId, index: true },
    amount: { type: Number, required: [true, 'cannot be empty.'], index: true },
    type: { type: String, required: [true, 'cannot be empty.'], index: true }
}, { timestamps: true, collection: 'userwallethistories' });
userWalletHistorySchema.pre('updateOne', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
userWalletHistorySchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
const userWalletHistoryselect = {
    ...stock_universal_server_1.globalSelectObj,
    wallet: 1,
    amount: 1,
    type: 1
};
exports.userWalletHistorySelect = userWalletHistoryselect;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
const createUserWalletHistoryModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(userWalletHistorySchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.userWalletHistoryMain = stock_universal_server_1.mainConnection
            .model('UserWalletHistory', userWalletHistorySchema);
    }
    if (lean) {
        exports.userWalletHistoryLean = stock_universal_server_1.mainConnectionLean
            .model('UserWalletHistory', userWalletHistorySchema);
    }
};
exports.createUserWalletHistoryModel = createUserWalletHistoryModel;
//# sourceMappingURL=user-wallet-history.model.js.map