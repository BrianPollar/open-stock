"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockAuthConfig = exports.isAuthServerRunning = exports.runStockAuthServer = void 0;
const tslib_1 = require("tslib");
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const company_routes_1 = require("./routes-dummy/company.routes");
const company_subscription_routes_1 = require("./routes-dummy/subscriptions/company-subscription.routes");
const subscription_package_routes_1 = require("./routes-dummy/subscriptions/subscription-package.routes");
const user_routes_1 = require("./routes-dummy/user.routes");
const company_routes_2 = require("./routes/company.routes");
const company_subscription_routes_2 = require("./routes/subscriptions/company-subscription.routes");
const subscription_package_routes_2 = require("./routes/subscriptions/subscription-package.routes");
const user_routes_2 = require("./routes/user.routes");
const stock_auth_local_1 = require("./stock-auth-local");
/**
 * Runs the stock authentication server by setting up the necessary configurations, connecting to the database, initializing passport authentication, and returning the authentication routes.
 * @param {IStockAuthServerConfig} config - The server configuration.
 * @param {EmailHandler} emailHandler - The email handler.
 * @param {*} app - The Express app.
 * @returns {Promise<{authRoutes, userLean}>}
 */
const runStockAuthServer = async (config) => {
    if (!(0, stock_notif_server_1.isNotificationsServerRunning)()) {
        const error = new Error('Notifications server is not running, please start by firing up that server');
        throw error;
    }
    (0, stock_auth_local_1.createStockAuthServerLocals)(config);
    // connect models
    await (0, stock_auth_local_1.connectAuthDatabase)(config.databaseConfigUrl);
    (0, stock_universal_server_1.runPassport)(config.authSecrets.jwtSecret);
    const stockAuthRouter = express_1.default.Router();
    if (!config.useDummyRoutes) {
        stockAuthRouter.use('/user', user_routes_2.userAuthRoutes);
        stockAuthRouter.use('/company', company_routes_2.companyAuthRoutes);
        // subscriptions
        stockAuthRouter.use('/subscriptionpackage', subscription_package_routes_2.subscriptionPackageRoutes);
        stockAuthRouter.use('/companysubscription', company_subscription_routes_2.companySubscriptionRoutes);
    }
    else {
        stockAuthRouter.use('/user', user_routes_1.userAuthRoutesDummy);
        stockAuthRouter.use('/company', company_routes_1.companyAuthRoutesDummy);
        // subscriptions
        stockAuthRouter.use('/subscriptionpackage', subscription_package_routes_1.subscriptionPackageRoutesDummy);
        stockAuthRouter.use('/companysubscription', company_subscription_routes_1.companySubscriptionRoutesDummy);
    }
    return Promise.resolve({ stockAuthRouter });
};
exports.runStockAuthServer = runStockAuthServer;
/**
 * Checks if the stock authentication server is running.
 * @returns {boolean} True if the server is running, false otherwise.
 */
const isAuthServerRunning = () => stock_auth_local_1.isStockAuthServerRunning;
exports.isAuthServerRunning = isAuthServerRunning;
/**
 * Retrieves the stock auth configuration.
 * @returns The stock auth configuration.
 */
const getStockAuthConfig = () => stock_auth_local_1.stockAuthConfig;
exports.getStockAuthConfig = getStockAuthConfig;
//# sourceMappingURL=stock-auth-server.js.map