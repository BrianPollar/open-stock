import { isNotificationsServerRunning } from '@open-stock/stock-notif-server';
import { runPassport, stockUniversalConfig } from '@open-stock/stock-universal-server';
import express from 'express';
import { companyAuthRoutesDummy } from './routes-dummy/company.routes';
import { companySubscriptionRoutesDummy } from './routes-dummy/subscriptions/company-subscription.routes';
import { superAdminRoutesDummy } from './routes-dummy/superadmin.routes';
import { userAuthRoutesDummy } from './routes-dummy/user.routes';
import { companyAuthRoutes } from './routes/company.routes';
import { companySubscriptionRoutes } from './routes/subscriptions/company-subscription.routes';
import { superAdminRoutes } from './routes/superadmin.routes';
import { userAuthRoutes } from './routes/user.routes';
import { connectAuthDatabase, createStockAuthServerLocals, isStockAuthServerRunning, stockAuthConfig } from './stock-auth-local';
/**
 * The PesaPal payment instance for the server.
 */
export let pesapalPaymentInstance;
/**
 * The URL to redirect to when a notification is received.
 */
export let notifRedirectUrl;
/**
 * Runs the stock authentication server by setting up the necessary configurations, connecting to the database, initializing passport authentication, and returning the authentication routes.
 * @param {IStockAuthServerConfig} config - The server configuration.
 * @param {EmailHandler} emailHandler - The email handler.
 * @param {*} app - The Express app.
 * @returns {Promise<{authRoutes, userLean}>}
 */
export const runStockAuthServer = async (config, paymentInstance) => {
    if (!isNotificationsServerRunning()) {
        const error = new Error('Notifications server is not running, please start by firing up that server');
        throw error;
    }
    pesapalPaymentInstance = paymentInstance;
    createStockAuthServerLocals(config);
    // connect models
    await connectAuthDatabase(config.databaseConfig.url, config.databaseConfig.dbOptions);
    runPassport(stockUniversalConfig.authSecrets.jwtSecret);
    const stockAuthRouter = express.Router();
    if (!config.useDummyRoutes) {
        stockAuthRouter.use('/user', userAuthRoutes);
        stockAuthRouter.use('/company', companyAuthRoutes);
        // subscriptions
        // stockAuthRouter.use('/subscriptionpackage', subscriptionPackageRoutes);
        stockAuthRouter.use('/companysubscription', companySubscriptionRoutes);
        stockAuthRouter.use('/admin', superAdminRoutes);
    }
    else {
        stockAuthRouter.use('/user', userAuthRoutesDummy);
        stockAuthRouter.use('/company', companyAuthRoutesDummy);
        // subscriptions
        // stockAuthRouter.use('/subscriptionpackage', subscriptionPackageRoutesDummy);
        stockAuthRouter.use('/companysubscription', companySubscriptionRoutesDummy);
        stockAuthRouter.use('/admin', superAdminRoutesDummy);
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