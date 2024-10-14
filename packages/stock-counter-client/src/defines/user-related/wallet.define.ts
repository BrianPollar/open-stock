import { User } from '@open-stock/stock-auth-client';
import {
  DatabaseAuto,
  IdataArrayResponse,
  IdeleteMany, IfilterProps,
  Istaff,
  IsubscriptionFeatureState,
  Isuccess,
  IuserWallet,
  IwalletHistory
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Staff } from './staff.define';


interface IgetOneFilter {
  _id?: string;
  userId?: string;
  companyId?: string;
  urId?: string;
}

export class UserWallet
  extends DatabaseAuto {
  urId: string;
  user: string | User;
  accountBalance = 0;
  currency: string;

  constructor(wallet: IuserWallet) {
    super(wallet);
    this.urId = wallet.urId;
    if (typeof wallet.user === 'string') {
      this.user = wallet.user;
    } else {
      this.user = new User(wallet.user);
    }
    this.accountBalance = wallet.accountBalance || 0;
    this.currency = wallet.currency;
  }

  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<IuserWallet>>(`/wallet/all/${offset}/${limit}`);
    const wallet = await lastValueFrom(observer$);

    return {
      count: wallet.count,
      wallet: wallet.data.map(val => new UserWallet(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<IuserWallet>>('/wallet/filter', filter);
    const wallet = await lastValueFrom(observer$);

    return {
      count: wallet.count,
      wallet: wallet.data.map(val => new UserWallet(val))
    };
  }

  static async getOne(filter: IgetOneFilter) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IuserWallet>('/wallet/one', filter);
    const wallet = await lastValueFrom(observer$);

    return new UserWallet(wallet);
  }

  static add(vals: IuserWallet) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IsubscriptionFeatureState>('/wallet/add', vals);

    return lastValueFrom(observer$);
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/wallet/delete/many', vals);

    return lastValueFrom(observer$);
  }

  async update(vals: IuserWallet) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/wallet/update', vals);

    const updated = await lastValueFrom(observer$);

    if (updated.success) {
      this.accountBalance = (vals.accountBalance || 0) + this.accountBalance;
      this.currency = vals.currency || this.currency;
    }

    return updated;
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/wallet/delete/one', { _id: this._id });

    return lastValueFrom(observer$);
  }
}


export class UserWalletHistory
  extends DatabaseAuto {
  urId: string;
  wallet: string | IuserWallet;
  amount: number;
  type: 'withdrawal' | 'deposit';

  constructor(walletHist: IwalletHistory) {
    super(walletHist);
    this.urId = walletHist.urId;
    this.wallet = walletHist.wallet;
    this.amount = walletHist.amount;
    this.type = walletHist.type;
  }

  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Istaff>>(`/wallet-history/all/${offset}/${limit}`);
    const staffs = await lastValueFrom(observer$);

    return {
      count: staffs.count,
      staffs: staffs.data.map(val => new Staff(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<Istaff>>('/wallet-history/filter', filter);
    const staffs = await lastValueFrom(observer$);

    return {
      count: staffs.count,
      staffs: staffs.data.map(val => new Staff(val))
    };
  }

  static async getOne(filter: IgetOneFilter) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Istaff>('/wallet-history/one', filter);
    const staff = await lastValueFrom(observer$);

    return new Staff(staff);
  }


  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/wallet-history/delete/many', vals);

    return lastValueFrom(observer$);
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/wallet-history/delete/one', { _id: this._id });

    return lastValueFrom(observer$);
  }
}
