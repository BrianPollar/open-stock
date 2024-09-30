import { DatabaseAuto, IblockedReasons, Icompany, IdeleteMany, IeditCompany, Ifile, IfilterProps, Isuccess } from '@open-stock/stock-universal';
import { User } from './user.define';
export declare class Company extends DatabaseAuto {
    urId: string;
    name: string;
    displayName: string;
    dateOfEst: string;
    address: string;
    details: string;
    businessType: string;
    websiteAddress: string;
    blockedReasons: IblockedReasons;
    left: boolean;
    dateLeft: Date;
    blocked: boolean;
    verified: boolean;
    owner: User | string;
    constructor(data: Icompany);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        companys: Company[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        companys: Company[];
    }>;
    static getOne(_id: string): Promise<Company>;
    static add(vals: IeditCompany): Promise<Isuccess>;
    static deleteCompanys(vals: IdeleteMany): Promise<Isuccess>;
    update(vals: IeditCompany, files?: Ifile[]): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
    appendUpdate(data: Icompany): void;
}
