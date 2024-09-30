import { DatabaseAuto, Iaddress, Ibilling, IdeleteMany, Ifile, IfileMeta, IfilterProps, Isuccess, Iuser, Iuserperm, TuserDispNameFormat, TuserType } from '@open-stock/stock-universal';
import { Company } from './company.define';
export declare class User extends DatabaseAuto {
    static routeUrl: string;
    urId: string;
    companyId: Company;
    names: string;
    fname: string;
    lname: string;
    companyName: string;
    email: string;
    address: Iaddress[];
    billing: Ibilling[];
    uid: string;
    did: string;
    aid: string;
    photos: IfileMeta[];
    profilePic: IfileMeta;
    profileCoverPic: IfileMeta;
    permissions: Iuserperm;
    phone: number;
    amountDue: number;
    readonly currency: string;
    manuallyAdded: boolean;
    online: boolean;
    salutation: string;
    extraCompanyDetails: string;
    userDispNameFormat: TuserDispNameFormat;
    userType?: TuserType;
    verified: boolean;
    constructor(data: Iuser);
    static existsEmailOrPhone(emailPhone: string): Promise<boolean>;
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        users: User[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        users: User[];
    }>;
    static getOne(urId: string): Promise<User>;
    static add(user: Partial<Iuser>, files?: Ifile[]): Promise<Isuccess>;
    static removeMany(vals: IdeleteMany): Promise<Isuccess>;
    update(vals: Iuser, files?: Ifile[]): Promise<Isuccess>;
    modifyPermissions(permissions: Iuserperm): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
    removeImages(filesWithDir: IfileMeta[]): Promise<Isuccess>;
    appendUpdate(data: Partial<Iuser>): void;
}
