import { ConnectOptions, Connection } from 'mongoose';
export declare let mainConnection: Connection;
export declare let mainConnectionLean: Connection;
export declare let isNotifDbConnected: boolean;
/**
 * Connects to the notification database using the provided configuration URL.
 * If the connection is already established, it returns immediately.
 *
 * @param databaseConfigUrl The URL of the notification database configuration.
 */
/**
 * Connects to the notification database using the provided configuration URL.
 * If the connection is already established, it returns immediately.
 * @param databaseConfigUrl - The URL of the notification database configuration.
 */
export declare const connectNotifDatabase: (databaseConfigUrl: string, dbOptions?: ConnectOptions) => Promise<void>;
