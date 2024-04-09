import { ConnectOptions, Connection } from 'mongoose';
/** The  mainConnection  and  mainConnectionLean  variables are used to store the main connections to the database*/
export declare let mainConnection: Connection;
export declare let mainConnectionLean: Connection;
/**  The  isUniversalDbConnected  variable is a flag to indicate whether the authentication database is connected. */
export declare let isUniversalDbConnected: boolean;
/**
 * The  connectUniversalDatabase  function is an asynchronous function that connects to the authentication database using the provided database configuration URL.
 * It first checks if the authentication database is already connected, and if so, it returns early.
 * Otherwise, it creates two new connections ( mainConnection  and  mainConnectionLean ) using the  makeNewConnection  function.
 * Once the connections are established, it sets the  isUniversalDbConnected  flag to  true .
 *
 * @param databaseConfigUrl - The URL of the database configuration.
 */
export declare const connectUniversalDatabase: (databaseConfigUrl: string, dbOptions?: ConnectOptions) => Promise<void>;
