/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { Iuser } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model } from 'mongoose';
export interface IschemaMethods {
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
    socialAuthFrameworks: number;
    countryCode: number;
    amountDue: number;
    manuallyAdded: number;
    updatedAt: number;
    createdAt: number;
    userType: number;
    photos: number;
    urId: number;
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
/**
 * Represents the userAboutSelect constant.
 */
export declare const userAboutSelect: {
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
    socialAuthFrameworks: number;
    updatedAt: number;
    createdAt: number;
    userType: number;
    photos: number;
    profilePic: number;
    profileCoverPic: number;
    urId: number;
    companyId: number;
    trackEdit: number;
    trackView: number;
    isDeleted: number;
    trackDeleted: number;
};
/**
 * Creates a user model with the specified database URL.
 * @param dbUrl The URL of the database.
 * @param main Indicates whether to create the main user model.
 * @param lean Indicates whether to create the lean user model.
 */
export declare const createUserModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
