"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUniversalServerRunning = exports.runStockUniversalServer = void 0;
const tslib_1 = require("tslib");
const stock_universal_local_1 = require("./stock-universal-local");
// const colors = require('colors');
const tracer = tslib_1.__importStar(require("tracer"));
const fs = tslib_1.__importStar(require("fs"));
const logger = tracer.colorConsole({
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
        fs.appendFile('./openStockLog/universal-server.log', data.rawoutput + '\n', err => {
            if (err) {
                throw err;
            }
        });
    }
});
/**
 * Runs the stock universal server.
 * @param databaseConfigUrl - The URL of the database configuration.
 * @returns A promise that resolves to an object indicating whether the stock universal server is running.
 */
const runStockUniversalServer = async (envCfig, databaseConfigUrl, dbOptions) => {
    logger.info('Starting the application...');
    logger.trace('Starting the application...');
    logger.debug('Starting the application...');
    logger.error('Starting the application...');
    (0, stock_universal_local_1.createStockUniversalServerLocals)(envCfig);
    // connect models
    await (0, stock_universal_local_1.connectUniversalDatabase)(databaseConfigUrl, dbOptions);
    return Promise.resolve({ isStockUniversalServerRunning: stock_universal_local_1.isStockUniversalServerRunning });
};
exports.runStockUniversalServer = runStockUniversalServer;
/**
 * Checks if the universal server for stock is running.
 * @returns {boolean} True if the universal server is running, false otherwise.
 */
const isUniversalServerRunning = () => stock_universal_local_1.isStockUniversalServerRunning;
exports.isUniversalServerRunning = isUniversalServerRunning;
//# sourceMappingURL=stock-universal-server.js.map