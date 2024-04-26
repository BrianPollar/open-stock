import { IenvironmentConfig } from '@open-stock/stock-universal';
import { ConnectOptions } from 'mongoose';
import { createFileMetaModel } from './models/filemeta.model';

/**
 * Indicates whether the stock universal server is currently running.
 */
export let isStockUniversalServerRunning = false;

export let envConfig: IenvironmentConfig;


/**
 * Creates stock universal server locals.
 */
export const createStockUniversalServerLocals = (envCfig: IenvironmentConfig) => {
  envConfig = envCfig;
  isStockUniversalServerRunning = true;
};

/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
export const connectUniversalDatabase = async(databaseUrl: string, dbOptions?: ConnectOptions): Promise<void> => {
  await createFileMetaModel(databaseUrl, dbOptions);
};
