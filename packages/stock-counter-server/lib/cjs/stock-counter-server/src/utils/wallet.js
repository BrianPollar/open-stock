"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalletHistory = exports.deleteAllAssociatedHistory = exports.delteWalltet = exports.getOneUesrWallet = exports.getAllWallets = exports.updateWallet = exports.creteWallet = exports.relegateCreaeWallet = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const user_wallet_history_model_1 = require("../models/printables/wallet/user-wallet-history.model");
const user_wallet_model_1 = require("../models/printables/wallet/user-wallet.model");
/**
   * Creates a new wallet for the given user if none exists, otherwise updates the
   * existing one.
   *
   * @param userId the id of the user for whom to create the wallet
   * @param wallet the wallet data to insert or update
   * @returns a success object indicating whether the operation was successful and
   *   the status code
   */
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
/**
   * Creates a new wallet for a user.
   *
   * @param wallet the wallet data to insert
   * @returns a success object indicating whether the operation was successful and
   *   the status code
   */
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
/**
   * Updates the wallet of a user.
   *
   * @param wallet the wallet data to update
   * @returns a success object indicating whether the operation was successful and
   *   the status code
   */
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
/**
   * Retrieves all wallets, sorted by id in descending order.
   *
   * @param offset the number of documents to skip
   * @param limit the number of documents to return
   * @returns a promise resolving to an array of wallet documents
   */
const getAllWallets = (offset = 0, limit = 10) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const all = user_wallet_model_1.userWalletLean.find({}).sort({ _id: -1 }).skip(offset).limit(limit).lean();
    return all;
};
exports.getAllWallets = getAllWallets;
/**
   * Retrieves a single user wallet by user id.
   *
   * @param userId the user id to retrieve the wallet for
   * @returns a promise resolving to the wallet document or an error object
   *   with a success of false and either a 401 status code with an
   *   unauthorized error, or a 404 status code with a not found error
   */
const getOneUesrWallet = (userId) => {
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return { success: false, status: 401, err: 'unauthourised' };
    }
    const one = user_wallet_model_1.userWalletLean.findOne({ user: userId }).lean();
    return one;
};
exports.getOneUesrWallet = getOneUesrWallet;
/**
   * Deletes a user wallet and all associated history.
   *
   * @param userId the user id to delete the wallet for
   * @returns a promise resolving to an object with a success of true
   */
const delteWalltet = async (userId) => {
    await (0, exports.deleteAllAssociatedHistory)(userId);
    await user_wallet_model_1.userWalletMain.deleteOne({ user: userId });
    return { success: true };
};
exports.delteWalltet = delteWalltet;
/**
   * Deletes all user wallet history associated with a given user id.
   *
   * @param userId the user id to delete history for
   * @returns a promise resolving to an object with a success of true
   */
const deleteAllAssociatedHistory = async (userId) => {
    await user_wallet_history_model_1.userWalletHistoryMain.deleteMany({ user: userId });
    return { success: true };
};
exports.deleteAllAssociatedHistory = deleteAllAssociatedHistory;
/**
   * Creates a new user wallet history document.
   *
   * @param hist the user wallet history to create
   * @returns a promise resolving to an object with a success of true
   */
const createWalletHistory = async (hist) => {
    const newHist = new user_wallet_history_model_1.userWalletHistoryMain(hist);
    await newHist.save();
    return { success: true };
};
exports.createWalletHistory = createWalletHistory;
//# sourceMappingURL=wallet.js.map