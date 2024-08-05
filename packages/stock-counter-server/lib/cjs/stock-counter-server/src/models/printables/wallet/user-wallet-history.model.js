"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserWalletHistoryModel = exports.userWalletHistorySelect = exports.userWalletHistoryLean = exports.userWalletHistoryMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const userWalletHistorySchema = new mongoose_1.Schema({
    trackEdit: { type: mongoose_1.Schema.ObjectId },
    trackView: { type: mongoose_1.Schema.ObjectId },
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
exports.userWalletHistorySelect = userWalletHistoryselect;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
const createUserWalletHistoryModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.userWalletHistoryMain = database_controller_1.mainConnection.model('UserWalletHistory', userWalletHistorySchema);
    }
    if (lean) {
        exports.userWalletHistoryLean = database_controller_1.mainConnectionLean.model('UserWalletHistory', userWalletHistorySchema);
    }
};
exports.createUserWalletHistoryModel = createUserWalletHistoryModel;
//# sourceMappingURL=user-wallet-history.model.js.map