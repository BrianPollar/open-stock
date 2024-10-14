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
/** The  connectDatabase  function connects to the authentication database by creating the required models. */
import { ConnectOptions } from 'mongoose';
import { IStockAuthServerConfig } from './stock-auth-server';
/**
 * Configuration object for the stock-auth-local module.
 */
export declare let stockAuthConfig: IStockAuthServerConfig;
/**
 * Indicates whether the Stock Auth Server is currently running.
 */
export declare let isStockAuthServerRunning: boolean;
/**
 * Creates stock auth server locals.
 * @param config - The configuration for the stock auth server.
 */
export declare const createStockAuthServerLocals: (config: IStockAuthServerConfig) => void;
/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
export declare const connectDatabase: (databaseUrl: string, dbOptions?: ConnectOptions) => Promise<void>;
