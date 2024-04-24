"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectUniversalDatabase = exports.createStockUniversalServerLocals = exports.isStockUniversalServerRunning = void 0;
const filemeta_model_1 = require("./models/filemeta.model");
/**
 * Indicates whether the stock universal server is currently running.
 */
exports.isStockUniversalServerRunning = false;
/**
 * Creates stock universal server locals.
 */
const createStockUniversalServerLocals = () => {
    exports.isStockUniversalServerRunning = true;
};
exports.createStockUniversalServerLocals = createStockUniversalServerLocals;
/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
const connectUniversalDatabase = async (databaseUrl, dbOptions) => {
    await (0, filemeta_model_1.createFileMetaModel)(databaseUrl, dbOptions);
};
exports.connectUniversalDatabase = connectUniversalDatabase;
//# sourceMappingURL=stock-universal-local.js.map