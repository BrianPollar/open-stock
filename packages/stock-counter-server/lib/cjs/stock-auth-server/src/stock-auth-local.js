"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectAuthDatabase = exports.createStockAuthServerLocals = exports.isStockAuthServerRunning = exports.stockAuthConfig = void 0;
/** The  connectAuthDatabase  function connects to the authentication database by creating the required models.*/
const company_model_1 = require("./models/company.model");
const emailtoken_model_1 = require("./models/emailtoken.model");
const company_subscription_model_1 = require("./models/subscriptions/company-subscription.model");
const user_model_1 = require("./models/user.model");
const userip_model_1 = require("./models/userip.model");
/**
 * Indicates whether the Stock Auth Server is currently running.
 */
exports.isStockAuthServerRunning = false;
/**
 * Creates stock auth server locals.
 * @param config - The configuration for the stock auth server.
 */
const createStockAuthServerLocals = (config) => {
    exports.stockAuthConfig = config;
    exports.isStockAuthServerRunning = true;
};
exports.createStockAuthServerLocals = createStockAuthServerLocals;
/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
const connectAuthDatabase = async (databaseUrl) => {
    await (0, emailtoken_model_1.createEmailtokenModel)(databaseUrl);
    await (0, user_model_1.createUserModel)(databaseUrl);
    await (0, company_model_1.createCompanyModel)(databaseUrl);
    await (0, userip_model_1.createUseripModel)(databaseUrl);
    await (0, company_subscription_model_1.createSubscriptionPackageModel)(databaseUrl);
    await (0, company_subscription_model_1.createSubscriptionPackageModel)(databaseUrl);
};
exports.connectAuthDatabase = connectAuthDatabase;
//# sourceMappingURL=stock-auth-local.js.map