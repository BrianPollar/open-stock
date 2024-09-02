/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { ConnectOptions } from 'mongoose';
import { PesaPalController } from 'pesapal3';
/**
 * Represents the configuration object for the StockCounterServer.
 */
export interface IstockcounterServerConfig {
    /**
     * The authentication secrets for the server.
     */
    /**
    * The database configuration.
    */
    databaseConfig: {
        url: string;
        dbOptions?: ConnectOptions;
    };
    /**
    * The URL for the notification redirect.
    */
    pesapalNotificationRedirectUrl: string;
    /**
    * The path configuration for the local server.
    */
    localPath: IlocalPath;
    useDummyRoutes?: boolean;
    ecommerceRevenuePercentage: number;
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
export declare const runAutoIntervaller: () => void;
