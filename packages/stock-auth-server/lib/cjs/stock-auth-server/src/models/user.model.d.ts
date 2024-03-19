/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
import { Iuser } from '@open-stock/stock-universal';
import { Document, Model } from 'mongoose';
interface IschemaMethods {
    comparePassword: (...args: any[]) => void;
    sendAuthyToken: (...args: any[]) => void;
    verifyAuthyToken: (...args: any[]) => void;
    sendMessage: (...args: any[]) => void;
    toAuthJSON: () => Partial<Iuser>;
    toProfileJSONFor: () => Partial<Iuser>;
    toJSONFor: () => Partial<Iuser>;
}
export type Tuser = Document & Iuser & IschemaMethods;
/**
 * Represents the user model.
 */
export declare let user: Model<Tuser>;
/**
 * Represents a lean user model.
 */
export declare let userLean: Model<Tuser>;
/**
 * Represents the user authentication select function.
 */
export declare const userAuthSelect: {
    urId: number;
    fname: number;
    lname: number;
    companyName: number;
    extraCompanyDetails: number;
    startDate: number;
    address: number;
    billing: number;
    profilePic: number;
    profileCoverPic: number;
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
    countryCode: number;
    amountDue: number;
    manuallyAdded: number;
    updatedAt: number;
    createdAt: number;
    userType: number;
    photos: number;
};
/**
 * Represents the userAboutSelect constant.
 */
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
    userType: number;
    photos: number;
    profilePic: number;
    profileCoverPic: number;
};
/**
 * Creates a user model with the specified database URL.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main user model.
 * @param lean Indicates whether to create the lean user model.
 */
export declare const createUserModel: (dbUrl: string, main?: boolean, lean?: boolean) => Promise<void>;
export {};
