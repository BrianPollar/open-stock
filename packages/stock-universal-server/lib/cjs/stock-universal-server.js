"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUniversalServerRunning = exports.runStockUniversalServer = void 0;
const tslib_1 = require("tslib");
const stock_universal_local_1 = require("./stock-universal-local");
// const colors = require('colors');
const express_1 = tslib_1.__importDefault(require("express"));
const back_logger_1 = require("./utils/back-logger");
const expressrouter_1 = require("./utils/expressrouter");
const track_1 = require("./utils/track");
/**
 * Runs the stock universal server.
 * @param databaseConfigUrl - The URL of the database configuration.
 * @returns A promise that resolves to an object indicating whether the stock universal server is running.
 */
const runStockUniversalServer = async (config) => {
    back_logger_1.mainLogger.info('Starting the application...');
    back_logger_1.mainLogger.trace('Starting the application...');
    back_logger_1.mainLogger.debug('Starting the application...');
    back_logger_1.mainLogger.error('Starting the application...');
    expressrouter_1.apiRouter.use(track_1.hasValidIdsInRequest);
    expressrouter_1.apiRouter.use(track_1.isDocDeleted);
    const stockUniversalRouter = express_1.default.Router();
    stockUniversalRouter.use('/track', track_1.trackRoutes);
    expressrouter_1.apiRouter.use(track_1.trackUser);
    (0, stock_universal_local_1.createStockUniversalServerLocals)(config);
    // connect models
    await (0, stock_universal_local_1.connectUniversalDatabase)(config.databaseConfig.url, config.databaseConfig.dbOptions);
    return { isStockUniversalServerRunning: stock_universal_local_1.isStockUniversalServerRunning, stockUniversalRouter };
};
exports.runStockUniversalServer = runStockUniversalServer;
/**
 * Checks if the universal server for stock is running.
 * @returns {boolean} True if the universal server is running, false otherwise.
 */
const isUniversalServerRunning = () => stock_universal_local_1.isStockUniversalServerRunning;
exports.isUniversalServerRunning = isUniversalServerRunning;
//# sourceMappingURL=stock-universal-server.js.map