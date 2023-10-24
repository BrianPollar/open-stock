// This function imports the `Request` interface from `express`.
import { Request } from 'express';

// This function imports the `fs-extra` module.
import * as fse from 'fs-extra';

// This function imports the `getLogger()` function from `log4js`.
import { getLogger } from 'log4js';

// This function imports the `multer` module.
import multer from 'multer';

// This function imports the `path` module.
import * as path from 'path';

// This function imports the `makeRandomString()` function from `@open-stock/stock-universal`.
import { makeRandomString } from '@open-stock/stock-universal';

// This function imports the `getExpressLocals()` function from `..constants/environment.constant`.
import { getExpressLocals } from '../constants/environment.constant';

// This function creates a fileStorageLogger named `controllers/FileStorage`.
const fileStorageLogger = getLogger('controllers/FileStorage');

// This interface defines the properties of a Multer request.
/** */
export interface IMulterRequest extends Request {
  file;
  files;
}

// This array defines the fields that Multer will use to upload files.
/** */
export const multerFileds: multer.Field[] = [
  { name: 'photos', maxCount: 6 },
  { name: 'videos', maxCount: 2 },
  { name: 'videothumbnail', maxCount: 2 }
];

// This function defines the storage strategy for Multer.
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
    fse.mkdir(storageDir, { recursive: true }, (err) => {
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
/** */
export const upload = multer({ storage: rudimentaryStorage });
