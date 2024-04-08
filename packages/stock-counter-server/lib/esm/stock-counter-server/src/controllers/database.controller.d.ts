/// <reference types="mongoose/types/connection" />
import { ConnectOptions, Connection } from 'mongoose';
export declare let mainConnection: Connection;
export declare let mainConnectionLean: Connection;
export declare let isStockDbConnected: boolean;
/**
 * Connects to the stock database using the provided database configuration URL.
 * If the database is already connected, this function does nothing.
 *
 * @param databaseConfigUrl The URL of the database configuration.
 */
export declare const connectStockDatabase: (databaseConfigUrl: string, dbOptions?: ConnectOptions) => Promise<void>;
