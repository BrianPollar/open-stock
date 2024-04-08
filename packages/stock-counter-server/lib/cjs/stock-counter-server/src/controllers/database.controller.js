"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectStockDatabase = exports.isStockDbConnected = exports.mainConnectionLean = exports.mainConnection = void 0;
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const log4js_1 = require("log4js");
const dbConnectionsLogger = (0, log4js_1.getLogger)('DbConnections');
exports.isStockDbConnected = false;
/**
 * Connects to the stock database using the provided database configuration URL.
 * If the database is already connected, this function does nothing.
 *
 * @param databaseConfigUrl The URL of the database configuration.
 */
const connectStockDatabase = async (databaseConfigUrl, dbOptions) => {
    if (exports.isStockDbConnected) {
        return;
    }
    exports.mainConnection = await (0, stock_universal_server_1.makeNewConnection)(databaseConfigUrl, dbOptions);
    exports.mainConnectionLean = await (0, stock_universal_server_1.makeNewConnection)(databaseConfigUrl, dbOptions);
    exports.isStockDbConnected = true;
};
exports.connectStockDatabase = connectStockDatabase;
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
            exports.isStockDbConnected = false;
            dbConnectionsLogger.info(`MONGODB EXIT ::
        Mongoose default connection
        disconnected through app termination`);
            process.exit(0);
        }
    })();
});
//# sourceMappingURL=database.controller.js.map