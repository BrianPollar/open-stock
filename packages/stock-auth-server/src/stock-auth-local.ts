
/** The  connectAuthDatabase  function connects to the authentication database by creating the required models.*/
import { ConnectOptions } from 'mongoose';
import { createCompanyModel } from './models/company.model';
import { createEmailtokenModel } from './models/emailtoken.model';
import { createCompanySubscription } from './models/subscriptions/company-subscription.model';
import { createSubscriptionPackageModel } from './models/subscriptions/subscription-package.model';
import { createUserModel } from './models/user.model';
import { createUseripModel } from './models/userip.model';
import { IStockAuthServerConfig } from './stock-auth-server';

/**
 * Configuration object for the stock-auth-local module.
 */
export let stockAuthConfig: IStockAuthServerConfig;

/**
 * Indicates whether the Stock Auth Server is currently running.
 */
export let isStockAuthServerRunning = false;

/**
 * Creates stock auth server locals.
 * @param config - The configuration for the stock auth server.
 */
export const createStockAuthServerLocals = (config: IStockAuthServerConfig) => {
  stockAuthConfig = config;
  isStockAuthServerRunning = true;
};

/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
export const connectAuthDatabase = async(databaseUrl: string, dbOptions?: ConnectOptions): Promise<void> => {
  await createEmailtokenModel(databaseUrl, dbOptions);
  await createUserModel(databaseUrl, dbOptions);
  await createCompanyModel(databaseUrl, dbOptions);
  await createUseripModel(databaseUrl);
  await createSubscriptionPackageModel(databaseUrl, dbOptions);
  await createCompanySubscription(databaseUrl, dbOptions);
};
