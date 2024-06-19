/// <reference types="mongoose/types/connection" />
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
import { ConnectOptions, Connection } from 'mongoose';
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
export declare const connectAuthDatabase: (databaseConfigUrl: string, dbOptions?: ConnectOptions) => Promise<void>;
