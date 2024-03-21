"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUniversalServerRunning = exports.runStockUniversalServer = void 0;
const stock_universal_local_1 = require("./stock-universal-local");
/**
 * Runs the stock universal server.
 * @param databaseConfigUrl - The URL of the database configuration.
 * @returns A promise that resolves to an object indicating whether the stock universal server is running.
 */
const runStockUniversalServer = async (databaseConfigUrl) => {
    (0, stock_universal_local_1.createStockUniversalServerLocals)();
    // connect models
    await (0, stock_universal_local_1.connectUniversalDatabase)(databaseConfigUrl);
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