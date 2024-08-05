"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserWalletModel = exports.userWalletSelect = exports.userWalletLean = exports.userWalletMain = void 0;
const mongoose_1 = require("mongoose");
const database_controller_1 = require("../../../controllers/database.controller");
const userWalletSchema = new mongoose_1.Schema({
    trackEdit: { type: mongoose_1.Schema.ObjectId },
    trackView: { type: mongoose_1.Schema.ObjectId },
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
exports.userWalletSelect = userWalletselect;
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
const createUserWalletModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    if (!database_controller_1.isStockDbConnected) {
        await (0, database_controller_1.connectStockDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.userWalletMain = database_controller_1.mainConnection.model('UserWallet', userWalletSchema);
    }
    if (lean) {
        exports.userWalletLean = database_controller_1.mainConnectionLean.model('UserWallet', userWalletSchema);
    }
};
exports.createUserWalletModel = createUserWalletModel;
//# sourceMappingURL=user-wallet.model.js.map