"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserWalletHistory = exports.UserWallet = void 0;
const stock_auth_client_1 = require("@open-stock/stock-auth-client");
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../../stock-counter-client");
const staff_define_1 = require("./staff.define");
class UserWallet extends stock_universal_1.DatabaseAuto {
    constructor(wallet) {
        super(wallet);
        this.accountBalance = 0;
        this.urId = wallet.urId;
        if (typeof wallet.user === 'string') {
            this.user = wallet.user;
        }
        else {
            this.user = new stock_auth_client_1.User(wallet.user);
        }
        this.accountBalance = wallet.accountBalance || 0;
        this.currency = wallet.currency;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/wallet/all/${offset}/${limit}`);
        const wallet = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: wallet.count,
            wallet: wallet.data.map(val => new UserWallet(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/wallet/filter', filter);
        const wallet = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: wallet.count,
            wallet: wallet.data.map(val => new UserWallet(val))
        };
    }
    static async getOne(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/wallet/one', filter);
        const wallet = await (0, rxjs_1.lastValueFrom)(observer$);
        return new UserWallet(wallet);
    }
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/wallet/add', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/wallet/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    async update(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/wallet/update', vals);
        const updated = await (0, rxjs_1.lastValueFrom)(observer$);
        if (updated.success) {
            this.accountBalance = (vals.accountBalance || 0) + this.accountBalance;
            this.currency = vals.currency || this.currency;
        }
        return updated;
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/wallet/delete/one', { _id: this._id });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.UserWallet = UserWallet;
class UserWalletHistory extends stock_universal_1.DatabaseAuto {
    constructor(walletHist) {
        super(walletHist);
        this.urId = walletHist.urId;
        this.wallet = walletHist.wallet;
        this.amount = walletHist.amount;
        this.type = walletHist.type;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/wallet-history/all/${offset}/${limit}`);
        const staffs = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new staff_define_1.Staff(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/wallet-history/filter', filter);
        const staffs = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: staffs.count,
            staffs: staffs.data.map(val => new staff_define_1.Staff(val))
        };
    }
    static async getOne(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/wallet-history/one', filter);
        const staff = await (0, rxjs_1.lastValueFrom)(observer$);
        return new staff_define_1.Staff(staff);
    }
    static removeMany(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/wallet-history/delete/many', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/wallet-history/delete/one', { _id: this._id });
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.UserWalletHistory = UserWalletHistory;
//# sourceMappingURL=wallet.define.js.map