/**
 * Indicates whether the stock counter server is currently running.
 */
export declare let isStockCounterServerRunning: boolean;
/**
 * The redirect URL for Pesapal notifications.
 */
export declare let pesapalNotifRedirectUrl: string;
/**
 * Creates stock counter server locals.
 * @param notifRedirectUrl - The notification redirect URL.
 */
export declare const createStockCounterServerLocals: (notifRedirectUrl: string) => void;
/**
 * Connects to the Stock Counter database.
 * po 8
 * @param databaseUrl The database URL for the server.
 * @returns A promise with the database models.
 */
export declare const connectStockCounterDatabase: (databaseUrl: string) => Promise<[void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void]>;
