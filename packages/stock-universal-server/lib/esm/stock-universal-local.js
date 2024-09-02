import cron from 'node-cron';
import { createFileMetaModel } from './models/filemeta.model';
import { createTrackDeletedModel } from './models/tracker/track-deleted.model';
import { createTrackEditModel } from './models/tracker/track-edit.model';
import { createTrackViewModel } from './models/tracker/track-view.model';
import { autoCleanFiles } from './utils/track';
/**
 * Indicates whether the stock universal server is currently running.
 */
export let isStockUniversalServerRunning = false;
export let stockUniversalConfig;
/**
 * Creates stock universal server locals.
 */
export const createStockUniversalServerLocals = (config) => {
    stockUniversalConfig = config;
    isStockUniversalServerRunning = true;
    stockUniversalConfig.expireDocAfterSeconds = stockUniversalConfig.expireDocAfterSeconds || 120;
};
/**
 * Connects to the authentication database by creating the required models.
 * @param {string} databaseUrl - The URL of the authentication database.
 * @returns {Promise<void>}
 */
export const connectUniversalDatabase = async (databaseUrl, dbOptions) => {
    await createFileMetaModel(databaseUrl, dbOptions);
    await createTrackViewModel(databaseUrl, dbOptions);
    await createTrackEditModel(databaseUrl, dbOptions);
    await createTrackDeletedModel(databaseUrl, dbOptions);
    job.start();
};
const job = cron.schedule('0 9 * * 1-7', async () => {
    console.log('Cron job running at 9 AM everyday');
    await autoCleanFiles();
});
//# sourceMappingURL=stock-universal-local.js.map