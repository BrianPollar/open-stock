// This function imports the `fs-extra` module.
import * as fse from 'fs-extra';
// This function imports the `getLogger()` function from `log4js`.
import { getLogger } from 'log4js';
// This function creates a fileMangerLogger named `FileManger`.
const fileMangerLogger = getLogger('FileManger');
// This function defines a function that creates directories.
/** */
export const createDirectories = async (appName, absolutepath, directories) => {
    // Check if the directory for the app name exists.
    await checkDirectoryExists(appName, 'first');
    // Create a promise for each directory in the list.
    const promises = directories
        .map(async (value) => {
        // Check if the directory exists.
        await checkDirectoryExists(absolutepath, value);
        // Return a promise that always resolves to true.
        return new Promise(resolve => resolve(true));
    });
    // Wait for all of the promises to resolve.
    await Promise.all(promises);
    // Return true.
    return true;
};
// This function defines a function that checks if a directory exists.
/** */
export const checkDirectoryExists = (absolutepath, dir, casel) => {
    return new Promise(resolve => {
        // Create a variable to store the directory path.
        let myDir;
        // If the `casel` parameter is `first`, then set the directory path to the absolute path.
        if (casel && casel === 'first') {
            myDir = absolutepath;
        }
        else {
            // Otherwise, set the directory path to the absolute path plus the directory name.
            myDir = absolutepath + '/' + dir;
        }
        // Log the directory path.
        fileMangerLogger.debug('FileManager', `"checkDirectoryExists", ${myDir}`);
        // Check if the directory exists.
        fse.access(myDir, function (err) {
            // If the directory does not exist, then create it.
            if (err && err.code === 'ENOENT') {
                fse.mkdir(myDir, function (mkdirErr) {
                    // If there is an error creating the directory, then log it.
                    if (mkdirErr) {
                        fileMangerLogger.error('FileManager', `"checkDirectoryExists 
                fse.mkdir error", ${mkdirErr}`);
                    }
                    // Resolve the promise with the string `created`.
                    resolve('created');
                });
            }
            else if (err) {
                // If there is an error accessing the directory, then log it.
                fileMangerLogger.error('FileManager', `"checkDirectoryExists 
            fse.access error", ${err}`);
                // Resolve the promise with the string `someError`.
                resolve('someError');
            }
            else {
                // If the directory exists, then resolve the promise with the string `exists`.
                resolve('exists');
            }
        });
    });
};
//# sourceMappingURL=filemanager.controller.js.map