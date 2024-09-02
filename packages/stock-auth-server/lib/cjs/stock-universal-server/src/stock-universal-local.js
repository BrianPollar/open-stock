"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectUniversalDatabase = exports.createStockUniversalServerLocals = exports.stockUniversalConfig = exports.isStockUniversalServerRunning = void 0;
const tslib_1 = require("tslib");
const node_cron_1 = tslib_1.__importDefault(require("node-cron"));
const filemeta_model_1 = require("./models/filemeta.model");
const track_deleted_model_1 = require("./models/tracker/track-deleted.model");
const track_edit_model_1 = require("./models/tracker/track-edit.model");
const track_view_model_1 = require("./models/tracker/track-view.model");
const track_1 = require("./utils/track");
/**
 * Indicates whether the stock universal server is currently running.
 */
exports.isStockUniversalServerRunning = false;
/**
 * Creates stock universal server locals.
 */
const createStockUniversalServerLocals = (config) => {
    exports.stockUniversalConfig = config;
    exports.isStockUniversalServerRunning = true;
    exports.stockUniversalConfig.expireDocAfterSeconds = exports.stockUniversalConfig.expireDocAfterSeconds || 120;
};
exports.createStockUniversalServerLocals = createStockUniversalServerLocals;
/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
const connectUniversalDatabase = async (databaseUrl, dbOptions) => {
    await (0, filemeta_model_1.createFileMetaModel)(databaseUrl, dbOptions);
    await (0, track_view_model_1.createTrackViewModel)(databaseUrl, dbOptions);
    await (0, track_edit_model_1.createTrackEditModel)(databaseUrl, dbOptions);
    await (0, track_deleted_model_1.createTrackDeletedModel)(databaseUrl, dbOptions);
    job.start();
};
exports.connectUniversalDatabase = connectUniversalDatabase;
const job = node_cron_1.default.schedule('0 9 * * 1-7', async () => {
    console.log('Cron job running at 9 AM everyday');
    await (0, track_1.autoCleanFiles)();
});
//# sourceMappingURL=stock-universal-local.js.map