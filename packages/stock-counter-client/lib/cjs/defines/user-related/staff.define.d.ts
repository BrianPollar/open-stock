import { IdeleteMany, IdeleteOne, IeditStaff, Ifile, IfilterProps, Isalary, Istaff, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { UserBase } from './userbase.define';
interface IgetOneFilter {
    _id?: string;
    userId?: string;
    companyId?: string;
}
export declare class Staff extends UserBase {
    employmentType: string;
    salary: Isalary;
    constructor(data: Istaff);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        staffs: Staff[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        staffs: Staff[];
    }>;
    static getByRole(role: string, offset?: number, limit?: number): Promise<{
        count: number;
        staffs: Staff[];
    }>;
    static getOne(filter: IgetOneFilter): Promise<Staff>;
    static add(vals: IeditStaff, files?: Ifile[]): Promise<IsubscriptionFeatureState>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    update(vals: IeditStaff, files: Ifile[]): Promise<Isuccess>;
    remove(val: IdeleteOne): Promise<Isuccess>;
}
export {};
