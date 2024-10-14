"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectMongoose = exports.makeNewConnection = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const back_logger_1 = require("./back-logger");
/**
 * Creates a new MongoDB connection.
 * @param uri - The URI of the MongoDB server.
 * @param coonType - The type of connection.
 * @returns The connection object.
 */
const makeNewConnection = async (uri, dbOptions) => {
    // Create a new MongoDB connection instance.
    const db = await mongoose_1.default.createConnection(uri, dbOptions).asPromise();
    // Set up an error handler that logs errors to the console.
    db.on('error', (error) => {
        back_logger_1.mainLogger.error(`MONGODB ERROR :: 
        connection to ${db.name} ${JSON.stringify(error)}`);
        db.close().catch(() => {
            back_logger_1.mainLogger.error(`MONGODB CLOSE ERROR:: 
        failed to close connection to ${db.name}`);
        });
    });
    // Set up a connected handler that logs the connection event to the console.
    db.on('connected', () => {
        mongoose_1.default.set('debug', (col, method, query, doc) => {
            const name = db.name;
            back_logger_1.mainLogger.debug(`"MONGODB :: " 
        name [name: %s]
        col [col:%s], method [method:%s],
        query [query:%s], doc [doc:%s]',
        ${name}, ${col}, ${method}, 
        ${JSON.stringify(query)},
        ${JSON.stringify(doc)}`);
        });
        back_logger_1.mainLogger.info(`MONGODB SUCCESS ::
        connected [uri:"%s"], ${uri}`);
    });
    // Set up a disconnected handler that logs the disconnection event to the console.
    db.on('disconnected', () => {
        back_logger_1.mainLogger.info(`MONGODB DISCONNECT ::
        disconnected [name:"%s"], ${db.name}`);
    });
    // Create a watch object for the connection.
    const watchit = db.watch();
    // Log the watch object to the console.
    back_logger_1.mainLogger.debug('LOGG OF WATCH FOR FUTURE IMPLEMENTATIONS', watchit);
    // Return the connection object.
    return db;
};
exports.makeNewConnection = makeNewConnection;
/**
 * Disconnects from the Mongoose database.
 * @returns {Promise<void>} A promise that resolves when the disconnection is complete.
 */
const disconnectMongoose = async () => {
    await mongoose_1.default.disconnect();
};
exports.disconnectMongoose = disconnectMongoose;
//# sourceMappingURL=connections.js.map