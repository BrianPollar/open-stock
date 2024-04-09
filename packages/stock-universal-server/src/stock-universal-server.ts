import { connectUniversalDatabase, createStockUniversalServerLocals, isStockUniversalServerRunning } from './stock-universal-local';

/**
 * Runs the stock universal server.
 * @param databaseConfigUrl - The URL of the database configuration.
 * @returns A promise that resolves to an object indicating whether the stock universal server is running.
 */
export const runStockUniversalServer = async(databaseConfigUrl: string) => { // TODO db options
  createStockUniversalServerLocals();
  // connect models
  await connectUniversalDatabase(databaseConfigUrl);
  return Promise.resolve({ isStockUniversalServerRunning });
};

/**
 * Checks if the universal server for stock is running.
 * @returns {boolean} True if the universal server is running, false otherwise.
 */
export const isUniversalServerRunning = () => isStockUniversalServerRunning;
