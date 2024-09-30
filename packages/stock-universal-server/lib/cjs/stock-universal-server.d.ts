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
import { IenvironmentConfig } from '@open-stock/stock-universal';
import { ConnectOptions } from 'mongoose';
/**
 * Represents the configuration options for the stock-auth-server.
 */
export interface IlAuth {
    jwtSecret: string;
    cookieSecret: string;
}
export interface IStockUniversalServerConfig {
    authSecrets: IlAuth;
    envCfig: IenvironmentConfig;
    trackUsers?: boolean;
    expireDocAfterSeconds?: number;
    databaseConfig: {
        url: string;
        dbOptions?: ConnectOptions;
    };
}
/**
 * Runs the stock universal server.
 * @param databaseConfigUrl - The URL of the database configuration.
 * @returns A promise that resolves to an object indicating whether the stock universal server is running.
 */
export declare const runStockUniversalServer: (config: IStockUniversalServerConfig) => Promise<{
    isStockUniversalServerRunning: boolean;
    stockUniversalRouter: import("express-serve-static-core").Router;
}>;
/**
 * Checks if the universal server for stock is running.
 * @returns {boolean} True if the universal server is running, false otherwise.
 */
export declare const isUniversalServerRunning: () => boolean;
