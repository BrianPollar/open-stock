import { IcustomRequest, IfileMeta } from '@open-stock/stock-universal';
import { NextFunction, Response } from 'express';
/**
 * Uploads files from the request to the server.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export declare const uploadFiles: (req: IcustomRequest<never, unknown>, res: Response, next: NextFunction) => void;
/**
 * Appends file metadata to the request body.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export declare const appendBody: (req: IcustomRequest<never, {
    data: string;
}>, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Saves the metadata to the database.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export declare const saveMetaToDb: (req: IcustomRequest<never, {
    newPhotos: IfileMeta[] | string[];
    thumbnail: IfileMeta;
}>, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Updates files in the file manager.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export declare const updateFiles: (req: IcustomRequest<never, unknown>, res: Response, next: NextFunction) => void;
export declare const deleteAllFiles: (filesWithDir: IfileMeta[], directlyRemove?: boolean) => Promise<boolean>;
/**
 * Deletes files from the server.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A Promise that resolves when the files are deleted.
 */
export declare const deleteFiles: (directlyRemove?: boolean) => (req: IcustomRequest<never, {
    filesWithDir: IfileMeta[];
}>, res: Response, next: NextFunction) => Promise<void>;
/**
 * Retrieves and downloads a single file.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A download of the specified file.
 */
export declare const getOneFile: (req: IcustomRequest<{
    filename: string;
}, unknown>, res: Response) => void;
/**
 * Returns a lazy function that sends a success response with status code 200 and a JSON body.
 * @param req - The request object.
 * @param res - The response object.
 */
export declare const returnLazyFn: (req: IcustomRequest<never, unknown>, res: any) => any;
export declare const removeBg: (imageSrc: string) => Promise<unknown>;
