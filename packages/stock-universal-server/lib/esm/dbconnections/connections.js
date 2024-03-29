import mongoose from 'mongoose';
import { getLogger } from 'log4js';
// This var creates a dbConnectionsLogger named `DbConnections`.
const dbConnectionsLogger = getLogger('DbConnections');
/**
 * Creates a new MongoDB connection.
 * @param uri - The URI of the MongoDB server.
 * @param coonType - The type of connection.
 * @returns The connection object.
 */
export const makeNewConnection = async (uri, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
coonType) => {
    // Create a new MongoDB connection instance.
    const db = await mongoose.createConnection(uri).asPromise();
    // Set up an error handler that logs errors to the console.
    db.on('error', (error) => {
        dbConnectionsLogger.error(`MONGODB ERROR :: 
        connection to ${db.name} ${JSON.stringify(error)}`);
        db.close().catch(() => {
            dbConnectionsLogger.error(`MONGODB CLOSE ERROR:: 
        failed to close connection to ${db.name}`);
        });
    });
    // Set up a connected handler that logs the connection event to the console.
    db.on('connected', () => {
        mongoose.set('debug', (col, method, query, doc) => {
            const name = db.name;
            dbConnectionsLogger.debug(`"MONGODB :: " 
        name [name: %s]
        col [col:%s], method [method:%s],
        query [query:%s], doc [doc:%s]',
        ${name}, ${col}, ${method}, 
        ${JSON.stringify(query)},
        ${JSON.stringify(doc)}`);
        });
        dbConnectionsLogger.info(`MONGODB SUCCESS ::
        connected [uri:"%s"], ${uri}`);
    });
    // Set up a disconnected handler that logs the disconnection event to the console.
    db.on('disconnected', () => {
        dbConnectionsLogger.info(`MONGODB DISCONNECT ::
        disconnected [name:"%s"], ${db.name}`);
    });
    // Create a watch object for the connection.
    const watchit = db.watch();
    // Log the watch object to the console.
    dbConnectionsLogger.debug('LOGG OF WATCH FOR FUTURE IMPLEMENTATIONS', watchit);
    // Return the connection object.
    return db;
};
/**
 * Disconnects from the Mongoose database.
 * @returns {Promise<void>} A promise that resolves when the disconnection is complete.
 */
export const disconnectMongoose = async () => {
    await mongoose.disconnect();
};
//# sourceMappingURL=connections.js.map