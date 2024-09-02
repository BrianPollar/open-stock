"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDirectoryExists = exports.createDirectories = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const fs_extra_1 = require("fs-extra");
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
// This function creates a fileMangerLogger named `FileManger`.
const fileMangerLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.log('data.output err ', err);
                }
            }
        });
        fs.appendFile(logDir + '/universal-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
/**
 * Creates directories for an application.
 * @param appName - The name of the application.
 * @param absolutepath - The absolute path where the directories will be created.
 * @param directories - An array of directory names to be created.
 * @returns A promise that resolves to a boolean indicating whether the directories were successfully created.
 */
const createDirectories = async (envConfig) => {
    // Check if the directory for the app name exists.
    await (0, exports.checkDirectoryExists)(envConfig.absolutepath, '', 'first');
    // Create a promise for each directory in the list.
    const directories = [
        envConfig.photoDirectory,
        envConfig.videoDirectory
    ];
    const promises = directories
        .map(async (value) => {
        // Check if the directory exists.
        await (0, exports.checkDirectoryExists)(envConfig.absolutepath, value);
        // Return a promise that always resolves to true.
        return new Promise(resolve => resolve(true));
    });
    // Wait for all of the promises to resolve.
    await Promise.all(promises);
    // Return true.
    return true;
};
exports.createDirectories = createDirectories;
// This function defines a function that checks if a directory exists.
/**
 * Checks if a directory exists at the specified path and creates it if it doesn't exist.
 * @param absolutepath - The absolute path of the directory or the parent directory.
 * @param dir - The name of the directory to check or create.
 * @param casel - Optional. Specifies whether to use the absolute path or the absolute path plus the directory name.
 *                 If set to 'first', the directory path will be set to the absolute path. Otherwise, it will be set to the absolute path plus the directory name.
 * @returns A Promise that resolves with a string indicating the result:
 *          - 'created' if the directory was created.
 *          - 'exists' if the directory already exists.
 *          - 'someError' if there was an error accessing or creating the directory.
 */
const checkDirectoryExists = (absolutepath, dir, casel) => {
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
        (0, fs_extra_1.access)(myDir, function (err) {
            // If the directory does not exist, then create it.
            if (err && err.code === 'ENOENT') {
                (0, fs_extra_1.mkdir)(myDir, function (mkdirErr) {
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
exports.checkDirectoryExists = checkDirectoryExists;
//# sourceMappingURL=filemanager.js.map