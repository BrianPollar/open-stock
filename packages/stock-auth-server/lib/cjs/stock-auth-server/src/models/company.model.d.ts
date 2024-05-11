import { Icompany } from '@open-stock/stock-universal';
import { ConnectOptions, Document, Model, Schema } from 'mongoose';
/**
 * Represents a company document with additional fields from the Icompany interface.
 */
export type Tcompany = Document & Icompany;
export declare const companySchema: Schema<Tcompany>;
/**
 * Represents the main company model.
 */
export declare let companyMain: Model<Tcompany>;
/**
 * Represents a lean company model.
 */
export declare let companyLean: Model<Tcompany>;
/**
 * Represents the company authentication select function.
 */
export declare const companyAuthSelect: {
    urId: number;
    name: number;
    displayName: number;
    dateOfEst: number;
    salutation: number;
    details: number;
    companyDispNameFormat: number;
    businessType: number;
    profilepic: number;
    profileCoverPic: number;
    createdAt: number;
    websiteAddress: number;
    photos: number;
    blocked: number;
    verified: number;
    expireAt: number;
    blockedReasons: number;
    left: number;
    dateLeft: number;
};
/**
 * Selects the company about information.
 */
export declare const companyAboutSelect: {
    urId: number;
    name: number;
    displayName: number;
    dateOfEst: number;
    salutation: number;
    details: number;
    companyDispNameFormat: number;
    businessType: number;
    profilepic: number;
    profileCoverPic: number;
    createdAt: number;
    websiteAddress: number;
    photos: number;
    blocked: number;
    verified: number;
    expireAt: number;
    blockedReasons: number;
    left: number;
    dateLeft: number;
};
/**
 * Creates a company model with the specified database URL.
 * @param dbUrl The URL of the database.
 * @param main Optional parameter indicating whether to create the main company model. Default is true.
 * @param lean Optional parameter indicating whether to create the lean company model. Default is true.
 */
export declare const createCompanyModel: (dbUrl: string, dbOptions?: ConnectOptions, main?: boolean, lean?: boolean) => Promise<void>;
