/// <reference types="mongoose/types/connection" />
import { Connection } from 'mongoose';
/** */
export declare let mainConnection: Connection;
export declare let mainConnectionLean: Connection;
/** */
export declare let isStockDbConnected: boolean;
/** */
export declare const connectStockDatabase: (databaseConfigUrl: string) => Promise<void>;
