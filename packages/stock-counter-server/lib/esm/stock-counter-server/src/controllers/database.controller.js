import { makeNewConnection } from '@open-stock/stock-universal-server';
import * as tracer from 'tracer';
import * as fs from 'fs';
const dbConnectionsLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = './openstockLog/';
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    throw err;
                }
            }
        });
        fs.appendFile('./openStockLog/counter-server.log', data.rawoutput + '\n', err => {
            if (err) {
                throw err;
            }
        });
    }
});
export let mainConnection;
export let mainConnectionLean;
export let isStockDbConnected = false;
/**
 * Connects to the stock database using the provided database configuration URL.
 * If the database is already connected, this function does nothing.
 *
 * @param databaseConfigUrl The URL of the database configuration.
 */
export const connectStockDatabase = async (databaseConfigUrl, dbOptions) => {
    if (isStockDbConnected) {
        return;
    }
    mainConnection = await makeNewConnection(databaseConfigUrl, dbOptions);
    mainConnectionLean = await makeNewConnection(databaseConfigUrl, dbOptions);
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