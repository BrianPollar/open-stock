import { Iuser } from '@open-stock/stock-universal';
import { Schema, Document, Model } from 'mongoose';
/** */
export type Tuser = Document & Iuser;
export declare const userSchema: Schema<Tuser>;
export declare let user: Model<Tuser>;
export declare let userLean: Model<Tuser>;
/** */
export declare const userAuthSelect: {
    urId: number;
    fname: number;
    lname: number;
    companyName: number;
    extraCompanyDetails: number;
    startDate: number;
    address: number;
    billing: number;
    uid: number;
    did: number;
    aid: number;
    photo: number;
    age: number;
    gender: number;
    admin: number;
    permissions: number;
    email: number;
    phone: number;
    expireAt: number;
    verified: number;
    authyId: number;
    password: number;
    fromsocial: number;
    socialframework: number;
    socialId: number;
    blocked: number;
    countryCode: number;
    amountDue: number;
    manuallyAdded: number;
    updatedAt: number;
    createdAt: number;
};
/** */
export declare const userAboutSelect: {
    urId: number;
    fname: number;
    lname: number;
    companyName: number;
    extraCompanyDetails: number;
    startDate: number;
    age: number;
    gender: number;
    admin: number;
    profilepic: number;
    profilecoverpic: number;
    description: number;
    fromsocial: number;
    socialframework: number;
    socialId: number;
    updatedAt: number;
    createdAt: number;
};
/** */
export declare const createUserModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
