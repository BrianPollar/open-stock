"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserWalletModel = exports.userWalletSelect = exports.userWalletLean = exports.userWalletMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const database_1 = require("../../../utils/database");
const userWalletSchema = new mongoose_1.Schema({
    ...stock_universal_server_1.globalSchemaObj,
    user: { type: String, required: [true, 'cannot be empty.'], index: true },
    amount: { type: Number, required: [true, 'cannot be empty.'], index: true },
    type: { type: String }
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
    amount: 1,
    type: 1
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
    if (!database_1.isStockDbConnected) {
        await (0, database_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.userWalletMain = database_1.mainConnection
            .model('UserWallet', userWalletSchema);
    }
    if (lean) {
        exports.userWalletLean = database_1.mainConnectionLean
            .model('UserWallet', userWalletSchema);
    }
};
exports.createUserWalletModel = createUserWalletModel;
//# sourceMappingURL=user-wallet.model.js.map