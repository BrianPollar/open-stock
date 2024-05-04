"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectStockDatabase = exports.isStockDbConnected = exports.mainConnectionLean = exports.mainConnection = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const tracer = tslib_1.__importStar(require("tracer"));
const fs = tslib_1.__importStar(require("fs"));
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