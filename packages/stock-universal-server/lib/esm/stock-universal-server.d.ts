/**
 * Runs the stock universal server.
 * @param databaseConfigUrl - The URL of the database configuration.
 * @returns A promise that resolves to an object indicating whether the stock universal server is running.
 */
export declare const runStockUniversalServer: (databaseConfigUrl: string) => Promise<{
    isStockUniversalServerRunning: boolean;
}>;
/**
 * Checks if the universal server for stock is running.
 * @returns {boolean} True if the universal server is running, false otherwise.
 */
export declare const isUniversalServerRunning: () => boolean;
