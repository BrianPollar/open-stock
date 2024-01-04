/** The  connectAuthDatabase  function connects to the authentication database by creating the required models.*/
import { createCompanyModel } from './models/company.model';
import { createEmailtokenModel } from './models/emailtoken.model';
import { createUserModel } from './models/user.model';
import { createUseripModel } from './models/userip.model';
/**
 * Configuration object for the stock-auth-local module.
 */
export let stockAuthConfig;
/**
 * Indicates whether the Stock Auth Server is currently running.
 */
export let isStockAuthServerRunning = false;
/**
 * Creates stock auth server locals.
 * @param config - The configuration for the stock auth server.
 */
export const createStockAuthServerLocals = (config) => {
    stockAuthConfig = config;
    isStockAuthServerRunning = true;
};
/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
export const connectAuthDatabase = async (databaseUrl) => {
    await createEmailtokenModel(databaseUrl);
    await createUserModel(databaseUrl);
    await createCompanyModel(databaseUrl);
    await createUseripModel(databaseUrl);
};
//# sourceMappingURL=stock-auth-local.js.map