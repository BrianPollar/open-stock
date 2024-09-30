import { makeNewConnection } from '@open-stock/stock-universal-server';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
const dbConnectionsLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path.join(process.cwd() + '/openstockLog/');
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log('data.output err ', err);
                }
            }
        });
        fs.appendFile(logDir + '/notif-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
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
export const connectNotifDatabase = async (databaseConfigUrl, dbOptions) => {
    if (isNotifDbConnected) {
        return;
    }
    mainConnection = await makeNewConnection(databaseConfigUrl, dbOptions);
    mainConnectionLean = await makeNewConnection(databaseConfigUrl, dbOptions);
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
//# sourceMappingURL=database.js.map