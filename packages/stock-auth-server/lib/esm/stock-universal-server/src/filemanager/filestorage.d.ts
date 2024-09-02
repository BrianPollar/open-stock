import { Request } from 'express';
import multer from 'multer';
/**
 * Represents an extended interface for handling Multer requests.
 */
export interface IMulterRequest extends Request {
    file: any;
    files: any;
}
/**
 * Array of multer fields for file storage.
 * Each field specifies the name and maximum count of files that can be uploaded.
 */
export declare const multerFileds: multer.Field[];
/**
 * Multer disk storage configuration for rudimentary file storage.
 * This storage configuration determines the destination directory and filename for uploaded files based on their MIME type.
 * @remarks
 * The destination directory is determined by the MIME type of the file. If the MIME type is an image, the file will be stored in the photoDirectory. If the MIME type is a video, the file will be stored in the videoDirectory.
 * The filename is generated based on the MIME type and a random string.
 */
declare const rudimentaryStorage: any;
/**
 * Uploads a file using multer and the specified storage.
 * @param multerOptions The options for multer.
 * @returns A multer instance for file uploading.
 */
export declare const upload: any;
export { rudimentaryStorage };
