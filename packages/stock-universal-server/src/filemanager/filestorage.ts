import { Request } from 'express';
import { mkdir } from 'fs-extra';
import { getLogger } from 'log4js';
import multer from 'multer';
import * as path from 'path';
import { makeRandomString } from '@open-stock/stock-universal';
import { getExpressLocals } from '../constants/environment.constant';

// This function creates a fileStorageLogger named `controllers/FileStorage`.
const fileStorageLogger = getLogger('controllers/FileStorage');

/**
 * Represents an extended interface for handling Multer requests.
 */
export interface IMulterRequest extends Request {
  file;
  files;
}

// This array defines the fields that Multer will use to upload files.

/**
 * Array of multer fields for file storage.
 * Each field specifies the name and maximum count of files that can be uploaded.
 */
export const multerFileds: multer.Field[] = [
  { name: 'photos', maxCount: 6 },
  { name: 'videos', maxCount: 2 },
  { name: 'videothumbnail', maxCount: 2 }
];

// This function defines the storage strategy for Multer.
/**
 * Multer disk storage configuration for rudimentary file storage.
 * This storage configuration determines the destination directory and filename for uploaded files based on their MIME type.
 * @remarks
 * The destination directory is determined by the MIME type of the file. If the MIME type is an image, the file will be stored in the photoDirectory. If the MIME type is a video, the file will be stored in the videoDirectory.
 * The filename is generated based on the MIME type and a random string.
 */
const rudimentaryStorage = multer.diskStorage({

  // This function gets the directory for the file based on its MIME type.
  destination(req: Request, file, cb) {
    const videoDirectory = getExpressLocals(req.app, 'videoDirectory');
    const photoDirectory = getExpressLocals(req.app, 'photoDirectory');

    const mimeType = file.mimetype;
    fileStorageLogger.debug('rudimentaryStorage - mimeType: ', mimeType);
    let storageDir: string;
    switch (mimeType) {
      case 'image/png':
      case 'image/jpg':
      case 'image/jpeg':
        storageDir = path.join(`${photoDirectory}`);
        break;
      case 'video/mp4':
        storageDir = path.join(`${videoDirectory}`);
        break;
      default:
        fileStorageLogger.error(`rudimentaryStorage 
        access tried with invalid mimetype,
          ${mimeType}`);
        return cb(new Error('mimetype not allowed'), '');
    }
    // const dir = path.join(`${lConfig.openphotoDirectory}`);
    fileStorageLogger.debug(`multer rudimentaryStorage dir : ${storageDir}`);
    mkdir(storageDir, { recursive: true }, (err) => {
      if (err) {
        fileStorageLogger.error(`multer 
              rudimentaryStorage fse.mkdir error: ${err}`);
      }
      cb(null, storageDir);
    });
  },
  filename(req: Request, file, cb) {
    const mimeType = file.mimetype;
    let extName: string;
    switch (mimeType) {
      case 'image/png':
        extName = '.png';
        break;
      case 'image/jpg':
        extName = '.jpg';
        break;
      case 'image/jpeg':
        extName = '.jpg';
        break;
      case 'video/mp4':
        extName = '.mp4';
        break;
      default:
        fileStorageLogger.error(`rudimentaryStorage 
        access tried with invalid mimetype,
          ${mimeType}`);
        return cb(new Error('mimetype not allowed'), '');
    }
    cb(null, 'FILE_' + makeRandomString(11, 'combined') + extName);
    // cb(null, 'PHOTO_' + makeRandomString(11) + path.extname(file.originalname));
  }
});

// const upload = multer({ rudimentaryStorage });

/**
 * Uploads a file using multer and the specified storage.
 * @param multerOptions The options for multer.
 * @returns A multer instance for file uploading.
 */
export const upload = multer({ storage: rudimentaryStorage });
export { rudimentaryStorage };
