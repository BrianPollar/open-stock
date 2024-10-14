"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWaitingWalletPaytModel = exports.waitingWalletPayLean = exports.waitingWalletPayMain = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const mongoose_1 = require("mongoose");
const waitingWalletPaySchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, required: [true, 'cannot be empty.'], index: true },
    walletId: { type: mongoose_1.Schema.Types.ObjectId, required: [true, 'can not be epmty'] },
    amount: {
        type: Number,
        required: [true, 'cannot be empty.'],
        index: true,
        min: [0, 'cannot be less than 0.']
    }
}, { timestamps: true, collection: 'userwallets' });
waitingWalletPaySchema.index({ expireAt: 1 }, { expireAfterSeconds: 2628003 });
/**
 * Creates a review model with the specified database URL, main connection flag, and lean flag.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main connection model.
 * @param lean Indicates whether to create the lean connection model.
 */
const createWaitingWalletPaytModel = async (dbUrl, dbOptions, main = true, lean = true) => {
    (0, stock_universal_server_1.createExpireDocIndex)(waitingWalletPaySchema);
    if (!stock_universal_server_1.isDbConnected) {
        await (0, stock_universal_server_1.connectDatabase)(dbUrl, dbOptions);
    }
    if (main) {
        exports.waitingWalletPayMain = stock_universal_server_1.mainConnection
            .model('WaitingWalletPaySchema', waitingWalletPaySchema);
    }
    if (lean) {
        exports.waitingWalletPayLean = stock_universal_server_1.mainConnectionLean
            .model('WaitingWalletPaySchema', waitingWalletPaySchema);
    }
};
exports.createWaitingWalletPaytModel = createWaitingWalletPaytModel;
//# sourceMappingURL=waiting-wallet-pay.model.js.map