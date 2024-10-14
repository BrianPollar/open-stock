import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, IdeleteMany, IfilterProps, IsubscriptionFeatureState, Isuccess, IuserWallet, IwalletHistory } from '@open-stock/stock-universal';
import { Staff } from './staff.define';
interface IgetOneFilter {
    _id?: string;
    userId?: string;
    companyId?: string;
    urId?: string;
}
export declare class UserWallet extends DatabaseAuto {
    urId: string;
    user: string | User;
    accountBalance: number;
    currency: string;
    constructor(wallet: IuserWallet);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        wallet: UserWallet[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        wallet: UserWallet[];
    }>;
    static getOne(filter: IgetOneFilter): Promise<UserWallet>;
    static add(vals: IuserWallet): Promise<IsubscriptionFeatureState>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    update(vals: IuserWallet): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
export declare class UserWalletHistory extends DatabaseAuto {
    urId: string;
    wallet: string | IuserWallet;
    amount: number;
    type: 'withdrawal' | 'deposit';
    constructor(walletHist: IwalletHistory);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        staffs: Staff[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        staffs: Staff[];
    }>;
    static getOne(filter: IgetOneFilter): Promise<Staff>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
export {};
