import { IfileMeta } from '@open-stock/stock-universal';
/**
 * Uploads files from the request to the server.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export declare const uploadFiles: (req: any, res: any, next: any) => void;
/**
 * Appends file metadata to the request body.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export declare const appendBody: (req: any, res: any, next: any) => any;
/**
 * Saves the metadata to the database.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export declare const saveMetaToDb: (req: any, res: any, next: any) => Promise<any>;
/**
 * Updates files in the file manager.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export declare const updateFiles: (req: any, res: any, next: any) => void;
export declare const deleteAllFiles: (filesWithDir: IfileMeta[]) => Promise<boolean>;
/**
 * Deletes files from the server.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A Promise that resolves when the files are deleted.
 */
export declare const deleteFiles: (req: any, res: any, next: any) => Promise<any>;
/**
 * Retrieves and downloads a single file.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A download of the specified file.
 */
export declare const getOneFile: (req: any, res: any) => any;
/**
 * Returns a lazy function that sends a success response with status code 200 and a JSON body.
 * @param req - The request object.
 * @param res - The response object.
 */
export declare const returnLazyFn: (req: any, res: any) => any;
export declare const removeBg: (imageSrc: string) => Promise<unknown>;
