/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
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
import { IstrategyCred } from '@open-stock/stock-universal-server';
import { ConnectOptions } from 'mongoose';
import { PesaPalController } from 'pesapal3';
/**
 * Represents the interface for local file paths.
 */
export interface IlocalPath {
    absolutepath: string;
    photoDirectory: string;
    videoDirectory: string;
}
/**
 * Represents the authentication information for an admin user.
 */
export interface IaAuth {
    processadminID: string;
    password: string;
}
/**
 * Represents the local environment configuration.
 */
export interface IlocalEnv {
    production: boolean;
    appName: string;
    appOfficialName: string;
    websiteAddr1: string;
    websiteAddr2: string;
}
/**
 * Represents the configuration for the Stock Auth Server.
 */
export interface IStockAuthServerConfig {
    adminAuth: IaAuth;
    localSettings: IlocalEnv;
    databaseConfig: {
        url: string;
        dbOptions?: ConnectOptions;
    };
    localPath: IlocalPath;
    permanentlyDeleteAfter: number;
    socialAuthStrategys?: IstrategyCred;
}
/**
 * The PesaPal payment instance for the server.
 */
export declare let pesapalPaymentInstance: PesaPalController;
/**
 * The URL to redirect to when a notification is received.
 */
export declare let notifRedirectUrl: string;
/**
 * Runs the stock authentication server by setting up the necessary configurations, connecting to the database,
 *  initializing passport authentication, and returning the authentication routes.
 * @param {IStockAuthServerConfig} config - The server configuration.
 * @param {EmailHandler} emailHandler - The email handler.
 * @param {*} app - The Express app.
 * @returns {Promise<{authRoutes, userLean}>}
 */
export declare const runStockAuthServer: (config: IStockAuthServerConfig, paymentInstance: PesaPalController) => Promise<{
    stockAuthRouter: import("express-serve-static-core").Router;
}>;
/**
 * Checks if the stock authentication server is running.
 * @returns {boolean} True if the server is running, false otherwise.
 */
export declare const isAuthServerRunning: () => boolean;
/**
 * Retrieves the stock auth configuration.
 * @returns The stock auth configuration.
 */
export declare const getStockAuthConfig: () => IStockAuthServerConfig;
