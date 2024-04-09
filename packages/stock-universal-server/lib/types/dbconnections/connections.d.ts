import mongoose, { ConnectOptions } from 'mongoose';
/**
 * Creates a new MongoDB connection.
 * @param uri - The URI of the MongoDB server.
 * @param coonType - The type of connection.
 * @returns The connection object.
 */
export declare const makeNewConnection: (uri: string, dbOptions?: ConnectOptions) => Promise<mongoose.Connection>;
/**
 * Disconnects from the Mongoose database.
 * @returns {Promise<void>} A promise that resolves when the disconnection is complete.
 */
export declare const disconnectMongoose: () => Promise<void>;
