/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
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
/**
 * Indicates whether the stock counter server is currently running.
 */
export declare let isStockCounterServerRunning: boolean;
/**
 * The redirect URL for Pesapal notifications.
 */
export declare let pesapalNotifRedirectUrl: string;
export declare let ecommerceRevenuePercentage: number;
/**
 * Creates stock counter server locals.
 * @param notifRedirectUrl - The notification redirect URL.
 */
export declare const createStockCounterServerLocals: (notifRedirectUrl: string, ecommerceRevenuePerntge: number, trackUsersBool?: boolean) => void;
/**
 * Connects to the Stock Counter database.
 * po 8
 * @param databaseUrl The database URL for the server.
 * @returns A promise with the database models.
 */
export declare const connectStockCounterDatabase: (databaseUrl: string, dbOptions?: ConnectOptions) => Promise<[void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void, void]>;
