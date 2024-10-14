import { connectUniversalDatabase, createStockUniversalServerLocals, isStockUniversalServerRunning } from './stock-universal-local';
// const colors = require('colors');
import express from 'express';
import { mainLogger } from './utils/back-logger';
import { apiRouter } from './utils/expressrouter';
import { hasValidIdsInRequest, isDocDeleted, trackRoutes, trackUser } from './utils/track';
/**
 * Runs the stock universal server.
 * @param databaseConfigUrl - The URL of the database configuration.
 * @returns A promise that resolves to an object indicating whether the stock universal server is running.
 */
export const runStockUniversalServer = async (config) => {
    mainLogger.info('Starting the application...');
    mainLogger.trace('Starting the application...');
    mainLogger.debug('Starting the application...');
    mainLogger.error('Starting the application...');
    apiRouter.use(hasValidIdsInRequest);
    apiRouter.use(isDocDeleted);
    const stockUniversalRouter = express.Router();
    stockUniversalRouter.use('/track', trackRoutes);
    apiRouter.use(trackUser);
    createStockUniversalServerLocals(config);
    // connect models
    await connectUniversalDatabase(config.databaseConfig.url, config.databaseConfig.dbOptions);
    return { isStockUniversalServerRunning, stockUniversalRouter };
};
/**
 * Checks if the universal server for stock is running.
 * @returns {boolean} True if the universal server is running, false otherwise.
 */
export const isUniversalServerRunning = () => isStockUniversalServerRunning;
//# sourceMappingURL=stock-universal-server.js.map