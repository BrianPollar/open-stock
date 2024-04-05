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
export declare const connectAuthDatabase: (databaseUrl: string) => Promise<void>;
