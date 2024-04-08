"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectAuthDatabase = exports.isAuthDbConnected = exports.mainConnectionLean = exports.mainConnection = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const log4js_1 = require("log4js");
/** The  dbConnectionsLogger  is a logger instance used for logging database connection-related messages. */
const dbConnectionsLogger = (0, log4js_1.getLogger)('DbConnections');
/**  The  isAuthDbConnected  variable is a flag to indicate whether the authentication database is connected. */
exports.isAuthDbConnected = false;
/**
 * The  connectAuthDatabase  function is an asynchronous function that connects to the authentication database using the provided database configuration URL.
 * It first checks if the authentication database is already connected, and if so, it returns early.
 * Otherwise, it creates two new connections ( mainConnection  and  mainConnectionLean ) using the  makeNewConnection  function.
 * Once the connections are established, it sets the  isAuthDbConnected  flag to  true .
 *
 * @param databaseConfigUrl - The URL of the database configuration.
 */
const connectAuthDatabase = async (databaseConfigUrl, dbOptions) => {
    if (exports.isAuthDbConnected) {
        return;
    }
    exports.mainConnection = await (0, stock_universal_server_1.makeNewConnection)(databaseConfigUrl, dbOptions);
    exports.mainConnectionLean = await (0, stock_universal_server_1.makeNewConnection)(databaseConfigUrl, dbOptions);
    exports.isAuthDbConnected = true;
};
exports.connectAuthDatabase = connectAuthDatabase;
/**
 * The  process.on('SIGINT', ...)  block is used to handle the SIGINT signal, which is sent when the user presses Ctrl+C to terminate the process.
 * When this signal is received, the block of code inside the callback function is executed.
 * In this case, it logs a message indicating that the process is disconnecting from the database and then closes the connections to the database.
 * If the connections are closed successfully, it logs a message indicating that the connections have been disconnected and exits the process with a status code of 0.
 */
process.on('SIGINT', () => {
    dbConnectionsLogger.info('PROCESS EXIT :: now disconnecting mongoose');
    (async () => {
        const closed = await Promise.all([
            exports.mainConnection.close(),
            // lean
            exports.mainConnectionLean.close()
        ]).catch(err => {
            dbConnectionsLogger.error(`MONGODB EXIT ::
        Mongoose default connection failed to close
        with error, ${err}`);
        });
        if (closed) {
            exports.isAuthDbConnected = true;
            dbConnectionsLogger.info(`MONGODB EXIT ::
        Mongoose default connection
        disconnected through app termination`);
            process.exit(0);
        }
    })();
});
//# sourceMappingURL=database.controller.js.map