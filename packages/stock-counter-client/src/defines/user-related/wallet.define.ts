import { User } from '@open-stock/stock-auth-client';
import { IuserWallet, IwalletHistory } from '@open-stock/stock-universal';

export class UserWallet {
  user: string | User;
  amount: number;
  type: string;

  constructor(wallet: IuserWallet) {}
}


export class UserWalletHistory {
  constructor(walletHist: IwalletHistory) {

  }
}
