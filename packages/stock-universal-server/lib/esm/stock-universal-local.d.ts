import { IenvironmentConfig } from '@open-stock/stock-universal';
import { ConnectOptions } from 'mongoose';
/**
 * Indicates whether the stock universal server is currently running.
 */
export declare let isStockUniversalServerRunning: boolean;
export declare let envConfig: IenvironmentConfig;
/**
 * Creates stock universal server locals.
 */
export declare const createStockUniversalServerLocals: (envCfig: IenvironmentConfig) => void;
/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
export declare const connectUniversalDatabase: (databaseUrl: string, dbOptions?: ConnectOptions) => Promise<void>;
