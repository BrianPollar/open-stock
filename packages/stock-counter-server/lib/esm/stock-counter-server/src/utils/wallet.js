import { verifyObjectId } from '@open-stock/stock-universal-server';
import { userWalletHistoryMain } from '../models/printables/wallet/user-wallet-history.model';
import { userWalletLean, userWalletMain } from '../models/printables/wallet/user-wallet.model';
/**
   * Creates a new wallet for the given user if none exists, otherwise updates the
   * existing one.
   *
   * @param userId the id of the user for whom to create the wallet
   * @param wallet the wallet data to insert or update
   * @returns a success object indicating whether the operation was successful and
   *   the status code
   */
export const relegateCreaeWallet = async (userId, wallet) => {
    const found = await userWalletLean.findOne({ user: userId }).lean();
    let res;
    if (!found) {
        wallet.user = userId;
        res = await creteWallet(wallet);
    }
    else {
        res = await updateWallet(wallet);
    }
};
/**
   * Creates a new wallet for a user.
   *
   * @param wallet the wallet data to insert
   * @returns a success object indicating whether the operation was successful and
   *   the status code
   */
export const creteWallet = async (wallet) => {
    const newWall = new userWalletMain(wallet);
    const saved = await newWall.save();
    const wallHist = {
        wallet: saved._id,
        amount: saved.accountBalance,
        type: 'deposit'
    };
    await createWalletHistory(wallHist);
    return { success: true };
};
/**
   * Updates the wallet of a user.
   *
   * @param wallet the wallet data to update
   * @returns a success object indicating whether the operation was successful and
   *   the status code
   */
export const updateWallet = async (wallet) => {
    const updated = await userWalletMain.updateOne({ user: wallet.user }, { accountBalance: wallet.accountBalance });
    const wallHist = {
        wallet: wallet._id,
        amount: wallet.accountBalance,
        type: 'deposit'
    };
    await createWalletHistory(wallHist);
    return { success: true };
};
/**
   * Retrieves all wallets, sorted by id in descending order.
   *
   * @param offset the number of documents to skip
   * @param limit the number of documents to return
   * @returns a promise resolving to an array of wallet documents
   */
export const getAllWallets = (offset = 0, limit = 10) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const all = userWalletLean.find({}).sort({ _id: -1 }).skip(offset).limit(limit).lean();
    return all;
};
/**
   * Retrieves a single user wallet by user id.
   *
   * @param userId the user id to retrieve the wallet for
   * @returns a promise resolving to the wallet document or an error object
   *   with a success of false and either a 401 status code with an
   *   unauthorized error, or a 404 status code with a not found error
   */
export const getOneUesrWallet = (userId) => {
    const isValid = verifyObjectId(userId);
    if (!isValid) {
        return { success: false, status: 401, err: 'unauthourised' };
    }
    const one = userWalletLean.findOne({ user: userId }).lean();
    return one;
};
/**
   * Deletes a user wallet and all associated history.
   *
   * @param userId the user id to delete the wallet for
   * @returns a promise resolving to an object with a success of true
   */
export const delteWalltet = async (userId) => {
    await deleteAllAssociatedHistory(userId);
    await userWalletMain.deleteOne({ user: userId });
    return { success: true };
};
/**
   * Deletes all user wallet history associated with a given user id.
   *
   * @param userId the user id to delete history for
   * @returns a promise resolving to an object with a success of true
   */
export const deleteAllAssociatedHistory = async (userId) => {
    await userWalletHistoryMain.deleteMany({ user: userId });
    return { success: true };
};
/**
   * Creates a new user wallet history document.
   *
   * @param hist the user wallet history to create
   * @returns a promise resolving to an object with a success of true
   */
export const createWalletHistory = async (hist) => {
    const newHist = new userWalletHistoryMain(hist);
    await newHist.save();
    return { success: true };
};
//# sourceMappingURL=wallet.js.map