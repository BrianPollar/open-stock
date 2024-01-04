import { IlAuth } from '@open-stock/stock-auth-server';
import { PesaPalController } from 'pesapal3';
/**
 * Represents the configuration object for the StockCounterServer.
 */
export interface IstockcounterServerConfig {
    /**
     * The authentication secrets for the server.
     */
    authSecrets: IlAuth;
    /**
    * The database configuration URL.
    */
    databaseConfigUrl: string;
    /**
    * The URL for the notification redirect.
    */
    pesapalNotificationRedirectUrl: string;
    /**
    * The path configuration for the local server.
    */
    localPath: IlocalPath;
    useDummyRoutes?: boolean;
}
/**
 * Represents the local path configuration for the server.
 */
export interface IlocalPath {
    /**
    * The absolute path for the server.
    */
    absolutepath: string;
    /**
    * The photo directory for the server.
    */
    photoDirectory: string;
    /**
    * The video directory for the server.
    */
    videoDirectory: string;
}
/**
 * The PesaPal payment instance for the server.
 */
export declare let pesapalPaymentInstance: PesaPalController;
/**
 * The URL to redirect to when a notification is received.
 */
export declare let notifRedirectUrl: string;
/**
 * Runs the Stock Counter server with the provided configuration and payment instance.
 * @param config - The configuration for the Stock Counter server.
 * @param paymentInstance - The payment instance for handling payments.
 * @returns A promise that resolves to an object containing the Stock Counter router.
 * @throws An error if the authentication server is not running.
 */
export declare const runStockCounterServer: (config: IstockcounterServerConfig, paymentInstance: PesaPalController) => Promise<{
    stockCounterRouter: any;
}>;
/**
 * Checks if the stock counter server is running.
 * @returns {boolean} True if the stock counter server is running, false otherwise.
 */
export declare const isCounterServerRunning: () => boolean;
