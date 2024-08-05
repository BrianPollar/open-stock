import { Isuccess, IuserWallet, IwalletHistory } from '@open-stock/stock-universal';
import { verifyObjectId } from '@open-stock/stock-universal-server';
import { userWalletHistoryMain } from '../models/printables/wallet/user-wallet-history.model';
import { userWalletLean, userWalletMain } from '../models/printables/wallet/user-wallet.model';

export const relegateCreaeWallet = async(userId: string, wallet: IuserWallet) => {
  const found = await userWalletLean.findOne({ user: userId }).lean();
  let res: Isuccess;

  if (!found) {
    wallet.user = userId;
    res = await creteWallet(wallet);
  } else {
    res = await updateWallet(wallet);
  }
};

export const creteWallet = async(wallet: IuserWallet) => {
  const newWall = new userWalletMain(wallet);
  const saved = await newWall.save();
  const wallHist: IwalletHistory = {
    wallet: saved._id,
    amount: saved.accountBalance,
    type: 'deposit'
  };

  await createWalletHistory(wallHist);

  return { success: true };
};

export const updateWallet = async(wallet: IuserWallet) => {
  const updated = await userWalletMain.updateOne({ user: wallet.user }, { accountBalance: wallet.accountBalance });
  const wallHist: IwalletHistory = {
    wallet: wallet._id,
    amount: wallet.accountBalance,
    type: 'deposit'
  };

  await createWalletHistory(wallHist);

  return { success: true };
};

export const getAllWallets = (offset = 0, limit = 10) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const all = userWalletLean.find({}).sort({ _id: -1 }).skip(offset).limit(limit).lean();

  return all;
};

export const getOneUesrWallet = (userId: string) => {
  const isValid = verifyObjectId(userId);

  if (!isValid) {
    return { success: false, status: 401, err: 'unauthourised' };
  }
  const one = userWalletLean.findOne({ user: userId }).lean();

  return one;
};

export const delteWalltet = async(userId: string) => {
  await deleteAllAssociatedHistory(userId);
  await userWalletMain.deleteOne({ user: userId });

  return { success: true };
};

export const deleteAllAssociatedHistory = async(userId: string) => {
  await userWalletHistoryMain.deleteMany({ user: userId });

  return { success: true };
};

export const createWalletHistory = async(hist: IwalletHistory) => {
  const newHist = new userWalletHistoryMain(hist);

  await newHist.save();

  return { success: true };
};

