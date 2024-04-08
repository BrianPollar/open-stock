import { makeNewConnection } from '@open-stock/stock-universal-server';
import { getLogger } from 'log4js';
import { ConnectOptions, Connection } from 'mongoose';

const dbConnectionsLogger = getLogger('DbConnections');

export let mainConnection: Connection;
export let mainConnectionLean: Connection;
export let isStockDbConnected = false;


/**
 * Connects to the stock database using the provided database configuration URL.
 * If the database is already connected, this function does nothing.
 *
 * @param databaseConfigUrl The URL of the database configuration.
 */
export const connectStockDatabase = async(databaseConfigUrl: string, dbOptions?: ConnectOptions) => {
  if (isStockDbConnected) {
    return;
  }
  mainConnection = await makeNewConnection(databaseConfigUrl, dbOptions);
  mainConnectionLean = await makeNewConnection(databaseConfigUrl, dbOptions);
  isStockDbConnected = true;
};


process.on('SIGINT', () => {
  dbConnectionsLogger.info('PROCESS EXIT :: now disconnecting mongoose');
  (async() => {
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
