import { makeNewConnection } from '@open-stock/stock-universal-server';
import { getLogger } from 'log4js';
const dbConnectionsLogger = getLogger('DbConnections');
export let mainConnection;
export let mainConnectionLean;
export let isStockDbConnected = false;
/**
 * Connects to the stock database using the provided database configuration URL.
 * If the database is already connected, this function does nothing.
 *
 * @param databaseConfigUrl The URL of the database configuration.
 */
export const connectStockDatabase = async (databaseConfigUrl) => {
    if (isStockDbConnected) {
        return;
    }
    mainConnection = await makeNewConnection(databaseConfigUrl, 'mainConnection');
    mainConnectionLean = await makeNewConnection(databaseConfigUrl, 'mainConnection');
    isStockDbConnected = true;
};
process.on('SIGINT', () => {
    dbConnectionsLogger.info('PROCESS EXIT :: now disconnecting mongoose');
    (async () => {
        const closed = await Promise.all([
            mainConnection.close(),
            // lean
            mainConnectionLean.close()
        ]).catch(err => {
            dbConnectionsLogger.error(`MONGODB EXIT ::
        Mongoose default connection failed to close
        with error, ${err}`);
        });
        if (closed) {
            isStockDbConnected = false;
            dbConnectionsLogger.info(`MONGODB EXIT ::
        Mongoose default connection
        disconnected through app termination`);
            process.exit(0);
        }
    })();
});
//# sourceMappingURL=database.controller.js.map