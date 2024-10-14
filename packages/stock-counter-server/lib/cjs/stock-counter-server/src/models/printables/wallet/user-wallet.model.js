"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserWalletModel = exports.userWalletSelect = exports.userWalletLean = exports.userWalletMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const userWalletSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.globalSchemaObj,
    user: { type: mongoose_1.Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
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
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
userWalletSchema.pre('updateMany', function (next) {
    return (0, stock_universal_server_1.preUpdateDocExpire)(this, next);
});
const userWalletselect = {
    ...stock_universal_server_1.globalSelectObj,
    user: 1,
    accountBalance: 1,
    currency: 1
};
exports.userWalletSelect = userWalletselect;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
const createUserWalletModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(userWalletSchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.userWalletMain = stock_universal_server_1.mainConnection
            .model('UserWallet', userWalletSchema);
    }
    if (lean) {
        exports.userWalletLean = stock_universal_server_1.mainConnectionLean
            .model('UserWallet', userWalletSchema);
    }
};
exports.createUserWalletModel = createUserWalletModel;
//# sourceMappingURL=user-wallet.model.js.map