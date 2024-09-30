/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
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
import { IcustomRequest, IcustomRequestSocial, IdeleteMany, IfileMeta, Iuser, TuserType } from '@open-stock/stock-universal';
import express, { NextFunction, Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
/**
 * Router for authentication routes.
 */
export declare const userAuthRoutes: import("express-serve-static-core").Router;
interface ImodelsCred {
    model: Model<any>;
    field: string;
    errMsg: string;
}
interface IuserLinkedInMoreModels {
    success: boolean;
    msg: string;
}
export declare const determineUserToRemove: (model: Model<any>, linkedModels: ImodelsCred[]) => (req: IcustomRequest<never, {
    _id: string;
    userId: string;
}>, res: Response, next: NextFunction) => Promise<express.Response<any, Record<string, any>>>;
export declare const determineUsersToRemove: (model: Model<any>, linkedModels: ImodelsCred[]) => (req: IcustomRequest<never, {
    _ids: string[];
    userIds: string[];
}>, res: any, next: any) => Promise<void>;
export declare const canRemoveOneUser: (id: string | mongoose.Types.ObjectId, modelsCred: ImodelsCred[]) => Promise<IuserLinkedInMoreModels>;
export declare const signupFactorRelgator: (req: IcustomRequest<never, {
    emailPhone: string;
    passwd: string;
    firstName: string;
    lastName: string;
    userType: TuserType;
    foundUser?: Iuser;
}>, res: Response, next: NextFunction) => Promise<void | express.Response<any, Record<string, any>>>;
export declare const userLoginRelegator: (req: Request, res: Response, next: NextFunction) => Promise<void | express.Response<any, Record<string, any>>>;
export declare const addUser: (req: IcustomRequest<never, {
    user: Iuser;
    profilePic?: string;
    coverPic?: string;
    newPhotos?: string[];
}>, res: Response, next: NextFunction) => Promise<void | express.Response<any, Record<string, any>>>;
export declare const updateUserBulk: (req: IcustomRequest<never, {
    user: Iuser;
    profilePic?: string;
    coverPic?: string;
    newPhotos?: string[] | IfileMeta[];
    profileOnly: string;
}>, res: Response, next: NextFunction) => Promise<void | express.Response<any, Record<string, any>>>;
export declare const removeOneUser: (req: IcustomRequest<never, {
    _id: string;
    userId: string;
}>, res: Response, next: NextFunction) => Promise<void | express.Response<any, Record<string, any>>>;
export declare const removeManyUsers: (req: IcustomRequest<never, {
    userIds?: string[];
} & IdeleteMany>, res: Response, next: NextFunction) => Promise<express.Response<any, Record<string, any>>>;
export declare const socialLogin: (provider: string) => (req: IcustomRequestSocial, res: any) => Promise<any>;
export {};
