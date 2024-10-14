"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.isDbConnected = exports.mainConnectionLean = exports.mainConnection = void 0;
const back_logger_1 = require("./back-logger");
const connections_1 = require("./connections");
/**  The  isDbConnected  variable is a flag to indicate whether the authentication database is connected. */
exports.isDbConnected = false;
/**
 * The  connectDatabase  function is an asynchronous
 * function that connects to the authentication database using the provided database configuration URL.
 * It first checks if the authentication database is already connected, and if so, it returns early.
 * Otherwise, it creates two new connections ( mainConnection
 * and  mainConnectionLean ) using the  makeNewConnection  function.
 * Once the connections are established, it sets the  isDbConnected  flag to  true .
 *
 * @param databaseConfigUrl - The URL of the database configuration.
 */
const connectDatabase = async (databaseConfigUrl, dbOptions) => {
    if (exports.isDbConnected) {
        return;
    }
    exports.mainConnection = await (0, connections_1.makeNewConnection)(databaseConfigUrl, dbOptions);
    exports.mainConnectionLean = await (0, connections_1.makeNewConnection)(databaseConfigUrl, dbOptions);
    exports.isDbConnected = true;
};
exports.connectDatabase = connectDatabase;
/**
 * The  process.on('SIGINT', ...)  block is used to handle
 * the SIGINT signal, which is sent when the user presses Ctrl+C to terminate the process.
 * When this signal is received, the block of code inside the callback function is executed.
 * In this case, it logs a message indicating that the process is
 * disconnecting from the database and then closes the connections to the database.
 * If the connections are closed successfully, it logs a message
 * indicating that the connections have been disconnected and exits the process with a status code of 0.
 */
process.on('SIGINT', () => {
    back_logger_1.mainLogger.info('PROCESS EXIT :: now disconnecting mongoose');
    (async () => {
        const closed = await Promise.all([
            exports.mainConnection.close(),
            // lean
            exports.mainConnectionLean.close()
        ]).catch(err => {
            back_logger_1.mainLogger.error(`MONGODB EXIT ::
        Mongoose default connection failed to close
        with error, ${err}`);
        });
        if (closed) {
            exports.isDbConnected = true;
            back_logger_1.mainLogger.info(`MONGODB EXIT ::
        Mongoose default connection
        disconnected through app termination`);
            process.exit(0);
        }
    })();
});
//# sourceMappingURL=database.js.map