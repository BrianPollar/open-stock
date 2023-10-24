import { IlAuth } from '@open-stock/stock-auth-server';
import { PesaPalController } from 'pesapal3';
import { EmailHandler } from '@open-stock/stock-notif-server';
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
    notifRedirectUrl: string;
    /**
    * The path configuration for the local server.
    */
    localPath: IlocalPath;
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
 * Connects to the Stock Counter database.
 *
 * @param databaseUrl The database URL for the server.
 * @returns A promise with the database models.
 */
export declare const connectStockCounterDatabase: (databaseUrl: string) => Promise<[void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void]>;
/** */
export declare const runStockCounterServer: (config: IstockcounterServerConfig, paymentInstance: PesaPalController, emailHandler: EmailHandler, app: any) => Promise<any>;
