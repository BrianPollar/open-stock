import { runPassport } from '@open-stock/stock-universal-server';
import { authRoutes } from './routes/user.routes';
import { companyAuthRoutes } from './routes/company.routes';
import { connectAuthDatabase, createStockAuthServerLocals, isStockAuthServerRunning, stockAuthConfig } from './stock-auth-local';
import { isNotificationsServerRunning } from '@open-stock/stock-notif-server';
import { authRoutesDummy } from './routes-dummy/user.routes';
import { companyAuthRoutesDummy } from './routes-dummy/company.routes';
import express from 'express';
/**
 * Runs the stock authentication server by setting up the necessary configurations, connecting to the database, initializing passport authentication, and returning the authentication routes.
 * @param {IStockAuthServerConfig} config - The server configuration.
 * @param {EmailHandler} emailHandler - The email handler.
 * @param {*} app - The Express app.
 * @returns {Promise<{authRoutes: any, userLean: any}>}
 */
export const runStockAuthServer = async (config) => {
    if (!isNotificationsServerRunning()) {
        const error = new Error('Notifications server is not running, please start by firing up that server');
        throw error;
    }
    createStockAuthServerLocals(config);
    // connect models
    await connectAuthDatabase(config.databaseConfigUrl);
    runPassport(config.authSecrets.jwtSecret);
    const stockAuthRouter = express.Router();
    if (!config.useDummyRoutes) {
        stockAuthRouter.use('/auth', authRoutes);
        stockAuthRouter.use('/company', companyAuthRoutes);
    }
    else {
        stockAuthRouter.use('/auth', authRoutesDummy);
        stockAuthRouter.use('/company', companyAuthRoutesDummy);
    }
    return Promise.resolve({ stockAuthRouter });
};
/**
 * Checks if the stock authentication server is running.
 * @returns {boolean} True if the server is running, false otherwise.
 */
export const isAuthServerRunning = () => isStockAuthServerRunning;
/**
 * Retrieves the stock auth configuration.
 * @returns The stock auth configuration.
 */
export const getStockAuthConfig = () => stockAuthConfig;
//# sourceMappingURL=stock-auth-server.js.map