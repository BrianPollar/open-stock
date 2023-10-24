"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStockAuthServer = exports.connectAuthDatabase = exports.StockAuthServer = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const auth_routes_1 = require("./routes/auth.routes");
const emailtoken_model_1 = require("./models/emailtoken.model");
const user_model_1 = require("./models/user.model");
;
;
;
/**The  StockAuthServer  class represents the stock authentication server and contains properties for admin authentication, authentication secrets, local environment settings, and an email handler. */
/** */
class StockAuthServer {
    constructor(aAuth, lAuth, localEnv, locaLMailHandler) {
        this.aAuth = aAuth;
        this.lAuth = lAuth;
        this.localEnv = localEnv;
        this.locaLMailHandler = locaLMailHandler;
    }
}
exports.StockAuthServer = StockAuthServer;
/** The  connectAuthDatabase  function connects to the authentication database by creating the required models.*/
const connectAuthDatabase = async (databaseUrl) => {
    await (0, emailtoken_model_1.createEmailtokenModel)(databaseUrl);
    await (0, user_model_1.createUserModel)(databaseUrl);
};
exports.connectAuthDatabase = connectAuthDatabase;
/** The  runStockAuthServer  function runs the stock authentication server by setting up the necessary configurations, connecting to the database, initializing passport authentication, and returning the authentication routes.*/
const runStockAuthServer = async (config, emailHandler, app) => {
    app.locals.authRoutes = true;
    Object.keys(config.localPath).forEach(key => {
        app.locals[key] = config.localPath[key];
    });
    const stockAuthServer = new StockAuthServer(config.adminAuth, config.authSecrets, config.localSettings, emailHandler);
    app.locals.stockAuthServer = stockAuthServer;
    // connect models
    await (0, exports.connectAuthDatabase)(config.databaseConfigUrl);
    (0, stock_universal_server_1.runPassport)(stockAuthServer.lAuth.jwtSecret);
    return { authRoutes: auth_routes_1.authRoutes, userLean: user_model_1.userLean };
};
exports.runStockAuthServer = runStockAuthServer;
//# sourceMappingURL=stock-auth-server.js.map