import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { Staff } from './staff.define';
export class UserWallet extends DatabaseAuto {
    constructor(wallet) {
        super(wallet);
        this.accountBalance = 0;
        this.urId = wallet.urId;
        if (typeof wallet.user === 'string') {
            this.user = wallet.user;
        }
        else {
            this.user = new User(wallet.user);
        }
        this.accountBalance = wallet.accountBalance || 0;
        this.currency = wallet.currency;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/wallet/all/${offset}/${limit}`);
        const wallet = await lastValueFrom(observer$);
        return {
            count: wallet.count,
            wallet: wallet.data.map(val => new UserWallet(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/wallet/filter', filter);
        const wallet = await lastValueFrom(observer$);
        return {
            count: wallet.count,
            wallet: wallet.data.map(val => new UserWallet(val))
        };
    }
    static async getOne(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/wallet/one', filter);
        const wallet = await lastValueFrom(observer$);
        return new UserWallet(wallet);
    }
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/wallet/add', vals);
        return lastValueFrom(observer$);
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/wallet/delete/many', vals);
        return lastValueFrom(observer$);
    }
    async update(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/wallet/update', vals);
        const updated = await lastValueFrom(observer$);
        if (updated.success) {
            this.accountBalance = (vals.accountBalance || 0) + this.accountBalance;
            this.currency = vals.currency || this.currency;
        }
        return updated;
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makePut('/wallet/delete/one', { _id: this._id });
        return lastValueFrom(observer$);
    }
}
export class UserWalletHistory extends DatabaseAuto {
    constructor(walletHist) {
        super(walletHist);
        this.urId = walletHist.urId;
        this.wallet = walletHist.wallet;
        this.amount = walletHist.amount;
        this.type = walletHist.type;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/wallet-history/all/${offset}/${limit}`);
        const staffs = await lastValueFrom(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new Staff(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/wallet-history/filter', filter);
        const staffs = await lastValueFrom(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new Staff(val))
        };
    }
    static async getOne(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/wallet-history/one', filter);
        const staff = await lastValueFrom(observer$);
        return new Staff(staff);
    }
    static removeMany(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/wallet-history/delete/many', vals);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makePut('/wallet-history/delete/one', { _id: this._id });
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=wallet.define.js.map