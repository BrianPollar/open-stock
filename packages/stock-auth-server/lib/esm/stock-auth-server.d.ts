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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { EmailHandler } from "@open-stock/stock-notif-server";
/** The  IlocalPath  interface defines the structure of the local file paths. */
export interface IlocalPath {
    absolutepath: string;
    photoDirectory: string;
    videoDirectory: string;
}
/** The  IaAuth  interface defines the structure of the admin authentication credentials. */
export interface IaAuth {
    processadminID: string;
    password: string;
}
/** The  IlAuth  interface defines the structure of the authentication secrets. */
export interface IlAuth {
    jwtSecret: string;
    cookieSecret: string;
}
/** The  IlocalEnv  interface defines the structure of the local environment settings. */
export interface IlocalEnv {
    production: boolean;
    appName: string;
    appOfficialName: string;
    websiteAddr1: string;
    websiteAddr2: string;
}
/** The  IStockAuthServerConfig  interface defines the structure of the server configuration.*/
export interface IStockAuthServerConfig {
    adminAuth: IaAuth;
    authSecrets: IlAuth;
    localSettings: IlocalEnv;
    databaseConfigUrl: string;
    localPath: IlocalPath;
}
/**The  StockAuthServer  class represents the stock authentication server and contains properties for admin authentication, authentication secrets, local environment settings, and an email handler. */
/** */
export declare class StockAuthServer {
    aAuth: IaAuth;
    lAuth: IlAuth;
    localEnv: IlocalEnv;
    locaLMailHandler: EmailHandler;
    constructor(aAuth: IaAuth, lAuth: IlAuth, localEnv: IlocalEnv, locaLMailHandler: EmailHandler);
}
/** The  connectAuthDatabase  function connects to the authentication database by creating the required models.*/
export declare const connectAuthDatabase: (databaseUrl: string) => Promise<void>;
/** The  runStockAuthServer  function runs the stock authentication server by setting up the necessary configurations, connecting to the database, initializing passport authentication, and returning the authentication routes.*/
export declare const runStockAuthServer: (config: IStockAuthServerConfig, emailHandler: EmailHandler, app: any) => Promise<{
    authRoutes: any;
    userLean: import("mongoose").Model<import("./models/user.model").Tuser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("./models/user.model").Tuser> & import("mongoose").Document<any, any, any> & import("@open-stock/stock-universal").Iuser & {
        _id: import("mongoose").Types.ObjectId;
    }, any>;
}>;
