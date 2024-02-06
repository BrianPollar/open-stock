/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/prefer-for-of */
import * as fs from 'fs';
import { getLogger } from 'log4js';
import multer from 'multer';
import * as path from 'path';
import { IMulterRequest, multerFileds, upload } from './filestorage';
import { getExpressLocals } from '../constants/environment.constant';
import { Icustomrequest, IfileMeta } from '@open-stock/stock-universal';
import { fileMeta } from '../models/filemeta.model';
const fsControllerLogger = getLogger('controllers/FsController');

/**
 * Uploads files from the request to the server.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const uploadFiles = (
  req,
  res,
  next
) => {
  const makeupload = upload.fields(multerFileds);
  makeupload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      fsControllerLogger.error('Multer UPLOAD ERROR', err);
      return res.status(500).send({ success: false });
    } else if (err) {
      // An unknown error occurred when uploading.
      fsControllerLogger.error('UNKWON UPLOAD ERROR', err);
      return res.status(500).send({ success: false });
    }
    return next();
  });
};

/**
 * Appends file metadata to the request body.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const appendBody = (
  req,
  res,
  next
) => {
  if (!(req as IMulterRequest).files) {
    return res.status(404).send({ success: false });
  }
  const { userId } = (req as Icustomrequest).user;
  const parsed = JSON.parse(req.body.data);
  const newFiles: IfileMeta[] = [];
  let thumbnail: IfileMeta;
  let profilePic: IfileMeta;
  let coverPic: IfileMeta;

  if ((req as IMulterRequest).files['profilePic']?.length) {
    profilePic = {
      userOrCompanayId: userId,
      name: (req as IMulterRequest).files['profilePic'][0].originalname,
      url: '/openphotos/' + (req as IMulterRequest).files['profilePic'][0].filename,
      type: (req as IMulterRequest).files['profilePic'][0].mimetype,
      version: '',
      storageDir: 'openphotos',
      size: (req as IMulterRequest).files['profilePic'][0].size
    };
    parsed.profilePic = profilePic;
  }

  if ((req as IMulterRequest).files['coverPic']?.length) {
    coverPic = {
      userOrCompanayId: userId,
      name: (req as IMulterRequest).files['coverPic'][0].originalname,
      url: '/openphotos/' + (req as IMulterRequest).files['coverPic'][0].filename,
      type: (req as IMulterRequest).files['coverPic'][0].mimetype,
      version: '',
      storageDir: 'openphotos',
      size: (req as IMulterRequest).files['coverPic'][0].size
    };
    parsed.coverPic = coverPic;
  }

  if ((req as IMulterRequest).files['photos']?.length) {
    for (let i = 0; i < (req as IMulterRequest).files['photos'].length; i++) {
      newFiles
        .push({
          userOrCompanayId: userId,
          name: (req as IMulterRequest).files['photos'][i].originalname,
          url: '/openphotos/' + (req as IMulterRequest).files['photos'][i].filename,
          type: (req as IMulterRequest).files['photos'][i].mimetype,
          version: '',
          size: (req as IMulterRequest).files['photos'][i].size,
          storageDir: 'openphotos'
        });
    }
  }

  if ((req as IMulterRequest).files['videos']?.length) {
    for (let i = 0; i < (req as IMulterRequest).files['videos'].length; i++) {
      newFiles
        .push({
          userOrCompanayId: userId,
          name: (req as IMulterRequest).files['videos'][i].originalname,
          url: '/openvideos/' + (req as IMulterRequest).files['videos'][i].filename,
          type: (req as IMulterRequest).files['videos'][i].mimetype,
          version: '',
          storageDir: 'openvideos',
          size: (req as IMulterRequest).files['videos'][i].size
        });
    }
  }

  if ((req as IMulterRequest).files['videothumbnail']?.length) {
    thumbnail = {
      userOrCompanayId: userId,
      name: (req as IMulterRequest).files['videothumbnail'][0].originalname,
      url: '/openphotos/' + (req as IMulterRequest).files['videothumbnail'][0].filename,
      type: (req as IMulterRequest).files['videothumbnail'][0].mimetype,
      version: '',
      storageDir: 'openphotos',
      size: (req as IMulterRequest).files['videothumbnail'][0].size
    };
    parsed.thumbnail = thumbnail;
  }

  parsed.newFiles = newFiles;
  req.body.parsed = parsed;
  return next();
};

/**
 * Saves the metadata to the database.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const saveMetaToDb = async(
  req,
  res,
  next
) => {
  const parsed = req.body.parsed;
  if (!parsed) {
    return next();
  }
  if (parsed.newFiles) {
    const promises = parsed.newFiles
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .map((value: IfileMeta) => new Promise(async(resolve) => {
        const newFileMeta = new fileMeta(value);
        const newSaved = await newFileMeta.save();
        resolve(newSaved);
      }));
    parsed.newFiles = await Promise.all(promises);
  }

  if (parsed.profilePic) {
    const newFileMeta = new fileMeta(parsed.profilePic);
    const newSaved = await newFileMeta.save();
    parsed.profilePic = newSaved._id;
    parsed.newFiles.push(newSaved);
  }

  if (parsed.coverPic) {
    const newFileMeta = new fileMeta(parsed.profilePic);
    const newSaved = await newFileMeta.save();
    parsed.coverPic = newSaved._id;
    parsed.newFiles.push(newSaved);
  }

  if (parsed.thumbnail) {
    const newFileMeta = new fileMeta(parsed.thumbnail);
    const newSaved = await newFileMeta.save();
    parsed.thumbnail = newSaved._id;
    parsed.newFiles.push(newSaved);
  }

  if (parsed.newFiles) {
    const mappedParsedFiles = parsed.newFiles.map((value: IfileMeta) => value._id);
    parsed.newFiles = mappedParsedFiles;
  }
  req.body.parsed = parsed; // newFiles are strings of ids
};

/**
 * Updates files in the file manager.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const updateFiles = (
  req,
  res,
  next
) => {
  const makeupload = upload.fields(multerFileds);
  makeupload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      fsControllerLogger.error('Multer UPLOAD ERROR', err);
      return res.status(404).send({ success: false });
    } else if (err) {
      // An unknown error occurred when uploading.
      fsControllerLogger.error('UNKWON UPLOAD ERROR', err);
      return res.status(404).send({ success: false });
    }
    return next();
  });
};

/**
 * Deletes files from the server.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A Promise that resolves when the files are deleted.
 */
export const deleteFiles = async(
  req,
  res,
  next) => {
  const { filesWithDir } = req.body;
  if (filesWithDir && !filesWithDir.length) {
    // return res.status(401).send({ error: 'unauthorised' }); // TODO better catch
  }
  const ids = filesWithDir.map((value/** : Ifilewithdir*/) => value._id);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  await fileMeta.deleteMany({ _id: { $in: ids } });

  if (filesWithDir && filesWithDir.length) {
    const promises = filesWithDir
      .map((value/** : Ifilewithdir*/) => new Promise(resolve => {
        fsControllerLogger.debug('deleting file', value.filename);
        const absolutepath = getExpressLocals(req.app, 'absolutepath');
        const nowpath = path
          .resolve(`${absolutepath}${value.filename}`);
        fs.unlink(nowpath, (err) => {
          if (err) {
            fsControllerLogger.error('error while deleting file',
              err);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      }));
    await Promise.all(promises);
  }
  return next();
};

/**
 * Retrieves and downloads a single file.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A download of the specified file.
 */
export const getOneFile = (
  req,
  res
) => {
  const { filename } = req.params;
  fsControllerLogger.debug(`download, file: ${filename}`);
  const absolutepath = getExpressLocals(req.app, 'absolutepath');
  const fileLocation = path.join(`${absolutepath}${filename}`, filename);
  return res.download(fileLocation, filename);
};

/**
 * Returns a lazy function that sends a success response with status code 200 and a JSON body.
 * @param req - The request object.
 * @param res - The response object.
 */
export const returnLazyFn = (req, res) => res.status(200).send({ success: true });
