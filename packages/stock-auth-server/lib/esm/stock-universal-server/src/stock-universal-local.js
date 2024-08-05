import { createFileMetaModel } from './models/filemeta.model';
import { createTrackViewModel } from './models/tracker/track-view.model';
import { createTrackEditModel } from './models/tracker/track-edit.model';
/**
 * Indicates whether the stock universal server is currently running.
 */
export let isStockUniversalServerRunning = false;
export let envConfig;
/**
 * Creates stock universal server locals.
 */
export const createStockUniversalServerLocals = (envCfig) => {
    envConfig = envCfig;
    isStockUniversalServerRunning = true;
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
};
//# sourceMappingURL=stock-universal-local.js.map