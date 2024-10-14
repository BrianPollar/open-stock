import { Iaddress, Icustomer, IdeleteMany, IeditCustomer, Ifile, IfilterProps, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { UserBase } from './userbase.define';
interface IgetOneFilter {
    _id?: string;
    userId?: string;
    companyId?: string;
    urId?: string;
}
export declare class Customer extends UserBase {
    otherAddresses?: Iaddress[];
    constructor(data: Icustomer);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        customers: Customer[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        customers: Customer[];
    }>;
    static getOne(filter: IgetOneFilter): Promise<Customer>;
    static add(vals: IeditCustomer, files?: Ifile[]): Promise<IsubscriptionFeatureState>;
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    update(vals: IeditCustomer, files?: Ifile[]): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
export {};
