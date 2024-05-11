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
 * Represents the configuration options for the stock-auth-server.
 */
export interface IlAuth {
    jwtSecret: string;
    cookieSecret: string;
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
    authSecrets: IlAuth;
    localSettings: IlocalEnv;
    databaseConfig: {
        url: string;
        dbOptions?: ConnectOptions;
    };
    localPath: IlocalPath;
    useDummyRoutes?: boolean;
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
 * Runs the stock authentication server by setting up the necessary configurations, connecting to the database, initializing passport authentication, and returning the authentication routes.
 * @param {IStockAuthServerConfig} config - The server configuration.
 * @param {EmailHandler} emailHandler - The email handler.
 * @param {*} app - The Express app.
 * @returns {Promise<{authRoutes, userLean}>}
 */
export declare const runStockAuthServer: (config: IStockAuthServerConfig, paymentInstance: PesaPalController) => Promise<{
    stockAuthRouter: any;
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
