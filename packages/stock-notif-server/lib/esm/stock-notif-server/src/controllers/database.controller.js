import { makeNewConnection } from '@open-stock/stock-universal-server';
import { getLogger } from 'log4js';
const dbConnectionsLogger = getLogger('DbConnections');
export let mainConnection;
export let mainConnectionLean;
export let isNotifDbConnected = false;
/**
 * Connects to the notification database using the provided configuration URL.
 * If the connection is already established, it returns immediately.
 *
 * @param databaseConfigUrl The URL of the notification database configuration.
 */
/**
 * Connects to the notification database using the provided configuration URL.
 * If the connection is already established, it returns immediately.
 * @param databaseConfigUrl - The URL of the notification database configuration.
 */
export const connectNotifDatabase = async (databaseConfigUrl) => {
    if (isNotifDbConnected) {
        return;
    }
    mainConnection = await makeNewConnection(databaseConfigUrl, 'mainConnection');
    mainConnectionLean = await makeNewConnection(databaseConfigUrl, 'mainConnection');
    isNotifDbConnected = true;
};
process.on('SIGINT', () => {
    dbConnectionsLogger.info('PROCESS EXIT :: now disconnecting mongoose');
    (async () => {
        const closed = await Promise.all([
            mainConnection?.close(),
            // lean
            mainConnectionLean?.close()
        ]).catch(err => {
            dbConnectionsLogger.error(`MONGODB EXIT ::
        Mongoose default connection failed to close
        with error, ${err}`);
        });
        if (closed) {
            dbConnectionsLogger.info(`MONGODB EXIT ::
        Mongoose default connection
        disconnected through app termination`);
            process.exit(0);
        }
    })();
});
//# sourceMappingURL=database.controller.js.map