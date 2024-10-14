import { mainLogger } from './back-logger';
import { makeNewConnection } from './connections';
/** The  mainConnection  and  mainConnectionLean  variables are used to store the main connections to the database */
export let mainConnection;
export let mainConnectionLean;
/**  The  isDbConnected  variable is a flag to indicate whether the authentication database is connected. */
export let isDbConnected = false;
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
export const connectDatabase = async (databaseConfigUrl, dbOptions) => {
    if (isDbConnected) {
        return;
    }
    mainConnection = await makeNewConnection(databaseConfigUrl, dbOptions);
    mainConnectionLean = await makeNewConnection(databaseConfigUrl, dbOptions);
    isDbConnected = true;
};
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
    mainLogger.info('PROCESS EXIT :: now disconnecting mongoose');
    (async () => {
        const closed = await Promise.all([
            mainConnection.close(),
            // lean
            mainConnectionLean.close()
        ]).catch(err => {
            mainLogger.error(`MONGODB EXIT ::
        Mongoose default connection failed to close
        with error, ${err}`);
        });
        if (closed) {
            isDbConnected = true;
            mainLogger.info(`MONGODB EXIT ::
        Mongoose default connection
        disconnected through app termination`);
            process.exit(0);
        }
    })();
});
//# sourceMappingURL=database.js.map