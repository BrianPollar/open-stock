import { Connection } from 'mongoose';
export declare let mainConnection: Connection;
export declare let mainConnectionLean: Connection;
export declare let isNotifDbConnected: boolean;
/** */
export declare const connectNotifDatabase: (databaseConfigUrl: string) => Promise<void>;
