"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalletHistory = exports.deleteAllAssociatedHistory = exports.delteWalltet = exports.getOneUesrWallet = exports.getAllWallets = exports.updateWallet = exports.creteWallet = exports.relegateCreaeWallet = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const user_wallet_history_model_1 = require("../models/printables/wallet/user-wallet-history.model");
const user_wallet_model_1 = require("../models/printables/wallet/user-wallet.model");
const relegateCreaeWallet = async (userId, wallet) => {
    const found = await user_wallet_model_1.userWalletLean.findOne({ user: userId }).lean();
    let res;
    if (!found) {
        wallet.user = userId;
        res = await (0, exports.creteWallet)(wallet);
    }
    else {
        res = await (0, exports.updateWallet)(wallet);
    }
};
exports.relegateCreaeWallet = relegateCreaeWallet;
const creteWallet = async (wallet) => {
    const newWall = new user_wallet_model_1.userWalletMain(wallet);
    const saved = await newWall.save();
    const wallHist = {
        wallet: saved._id,
        amount: saved.accountBalance,
        type: 'deposit'
    };
    await (0, exports.createWalletHistory)(wallHist);
    return { success: true };
};
exports.creteWallet = creteWallet;
const updateWallet = async (wallet) => {
    const updated = await user_wallet_model_1.userWalletMain.updateOne({ user: wallet.user }, { accountBalance: wallet.accountBalance });
    const wallHist = {
        wallet: wallet._id,
        amount: wallet.accountBalance,
        type: 'deposit'
    };
    await (0, exports.createWalletHistory)(wallHist);
    return { success: true };
};
exports.updateWallet = updateWallet;
const getAllWallets = (offset = 0, limit = 10) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const all = user_wallet_model_1.userWalletLean.find({}).sort({ _id: -1 }).skip(offset).limit(limit).lean();
    return all;
};
exports.getAllWallets = getAllWallets;
const getOneUesrWallet = (userId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return { success: false, status: 401, err: 'unauthourised' };
    }
    const one = user_wallet_model_1.userWalletLean.findOne({ user: userId }).lean();
    return one;
};
exports.getOneUesrWallet = getOneUesrWallet;
const delteWalltet = async (userId) => {
    await (0, exports.deleteAllAssociatedHistory)(userId);
    await user_wallet_model_1.userWalletMain.deleteOne({ user: userId });
    return { success: true };
};
exports.delteWalltet = delteWalltet;
const deleteAllAssociatedHistory = async (userId) => {
    await user_wallet_history_model_1.userWalletHistoryMain.deleteMany({ user: userId });
    return { success: true };
};
exports.deleteAllAssociatedHistory = deleteAllAssociatedHistory;
const createWalletHistory = async (hist) => {
    const newHist = new user_wallet_history_model_1.userWalletHistoryMain(hist);
    await newHist.save();
    return { success: true };
};
exports.createWalletHistory = createWalletHistory;
//# sourceMappingURL=wallet.comtroller.js.map