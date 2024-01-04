/// <reference types="mongoose/types/connection" />
import { Connection } from 'mongoose';
/** The  mainConnection  and  mainConnectionLean  variables are used to store the main connections to the database*/
export declare let mainConnection: Connection;
export declare let mainConnectionLean: Connection;
/**  The  isAuthDbConnected  variable is a flag to indicate whether the authentication database is connected. */
export declare let isAuthDbConnected: boolean;
/**
 * The  connectAuthDatabase  function is an asynchronous function that connects to the authentication database using the provided database configuration URL.
 * It first checks if the authentication database is already connected, and if so, it returns early.
 * Otherwise, it creates two new connections ( mainConnection  and  mainConnectionLean ) using the  makeNewConnection  function.
 * Once the connections are established, it sets the  isAuthDbConnected  flag to  true .
 *
 * @param databaseConfigUrl - The URL of the database configuration.
 */
export declare const connectAuthDatabase: (databaseConfigUrl: string) => Promise<void>;
