import { runPassport } from "@open-stock/stock-universal-server";
import { authRoutes } from "./routes/auth.routes";
import { createEmailtokenModel } from "./models/emailtoken.model";
import { createUserModel, userLean } from "./models/user.model";
;
;
;
/**The  StockAuthServer  class represents the stock authentication server and contains properties for admin authentication, authentication secrets, local environment settings, and an email handler. */
/** */
export class StockAuthServer {
    constructor(aAuth, lAuth, localEnv, locaLMailHandler) {
        this.aAuth = aAuth;
        this.lAuth = lAuth;
        this.localEnv = localEnv;
        this.locaLMailHandler = locaLMailHandler;
    }
}
/** The  connectAuthDatabase  function connects to the authentication database by creating the required models.*/
export const connectAuthDatabase = async (databaseUrl) => {
    await createEmailtokenModel(databaseUrl);
    await createUserModel(databaseUrl);
};
/** The  runStockAuthServer  function runs the stock authentication server by setting up the necessary configurations, connecting to the database, initializing passport authentication, and returning the authentication routes.*/
export const runStockAuthServer = async (config, emailHandler, app) => {
    app.locals.authRoutes = true;
    Object.keys(config.localPath).forEach(key => {
        app.locals[key] = config.localPath[key];
    });
    const stockAuthServer = new StockAuthServer(config.adminAuth, config.authSecrets, config.localSettings, emailHandler);
    app.locals.stockAuthServer = stockAuthServer;
    // connect models
    await connectAuthDatabase(config.databaseConfigUrl);
    runPassport(stockAuthServer.lAuth.jwtSecret);
    return { authRoutes, userLean };
};
//# sourceMappingURL=stock-auth-server.js.map