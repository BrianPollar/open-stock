import { ConnectOptions } from 'mongoose';
/**
 * Indicates whether the stock universal server is currently running.
 */
export declare let isStockUniversalServerRunning: boolean;
/**
 * Creates stock universal server locals.
 */
export declare const createStockUniversalServerLocals: () => void;
/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
export declare const connectUniversalDatabase: (databaseUrl: string, dbOptions?: ConnectOptions) => Promise<void>;
