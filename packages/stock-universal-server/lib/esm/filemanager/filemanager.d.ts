import { IenvironmentConfig } from '@open-stock/stock-universal';
/**
 * Creates directories for an application.
 * @param appName - The name of the application.
 * @param absolutepath - The absolute path where the directories will be created.
 * @param directories - An array of directory names to be created.
 * @returns A promise that resolves to a boolean indicating whether the directories were successfully created.
 */
export declare const createDirectories: (envConfig: IenvironmentConfig) => Promise<boolean>;
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
export declare const checkDirectoryExists: (absolutepath: string, dir: string, casel?: any) => Promise<string>;
