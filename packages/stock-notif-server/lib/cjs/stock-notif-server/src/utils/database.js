"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectNotifDatabase = exports.isNotifDbConnected = exports.mainConnectionLean = exports.mainConnection = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const dbConnectionsLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
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
exports.isNotifDbConnected = false;
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
const connectNotifDatabase = async (databaseConfigUrl, dbOptions) => {
    if (exports.isNotifDbConnected) {
        return;
    }
    exports.mainConnection = await (0, stock_universal_server_1.makeNewConnection)(databaseConfigUrl, dbOptions);
    exports.mainConnectionLean = await (0, stock_universal_server_1.makeNewConnection)(databaseConfigUrl, dbOptions);
    exports.isNotifDbConnected = true;
};
exports.connectNotifDatabase = connectNotifDatabase;
process.on('SIGINT', () => {
    dbConnectionsLogger.info('PROCESS EXIT :: now disconnecting mongoose');
    (async () => {
        const closed = await Promise.all([
            exports.mainConnection?.close(),
            // lean
            exports.mainConnectionLean?.close()
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