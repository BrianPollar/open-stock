/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Icustomrequest, IfileMeta } from '@open-stock/stock-universal';
import * as fs from 'fs';
import multer from 'multer';
import * as path from 'path';
import * as tracer from 'tracer';
import { fileMeta } from '../models/filemeta.model';
import { envConfig } from '../stock-universal-local';
import { IMulterRequest, multerFileds, upload } from './filestorage';

const fsControllerLogger = tracer.colorConsole(
  {
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
      // eslint-disable-next-line no-console
      console.log(data.output);
      const logDir = path.join(process.cwd() + '/openstockLog/');
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
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const videoDirectory = path.join(envConfig.videoDirectory + '/' + queryId + '/');
  const photoDirectory = path.join(envConfig.photoDirectory + '/' + queryId + '/');
  const { userId } = (req as Icustomrequest).user;
  const parsed = JSON.parse(req.body.data);
  const newPhotos: IfileMeta[] = [];
  const newVideos: IfileMeta[] = [];
  let thumbnail: IfileMeta;
  let profilePic: IfileMeta;
  let coverPic: IfileMeta;

  if ((req as IMulterRequest).files['profilePic']?.length) {
    profilePic = {
      userOrCompanayId: userId,
      name: (req as IMulterRequest).files['profilePic'][0].originalname,
      url: photoDirectory + (req as IMulterRequest).files['profilePic'][0].filename,
      type: (req as IMulterRequest).files['profilePic'][0].mimetype,
      version: '',
      storageDir: photoDirectory,
      size: (req as IMulterRequest).files['profilePic'][0].size
    };
    parsed.profilePic = profilePic;
    newPhotos.push(profilePic);
  }

  if ((req as IMulterRequest).files['coverPic']?.length) {
    coverPic = {
      userOrCompanayId: userId,
      name: (req as IMulterRequest).files['coverPic'][0].originalname,
      url: photoDirectory + (req as IMulterRequest).files['coverPic'][0].filename,
      type: (req as IMulterRequest).files['coverPic'][0].mimetype,
      version: '',
      storageDir: photoDirectory,
      size: (req as IMulterRequest).files['coverPic'][0].size
    };
    parsed.coverPic = coverPic;
    newPhotos.push(coverPic);
  }

  if ((req as IMulterRequest).files['photos']?.length) {
    for (let i = 0; i < (req as IMulterRequest).files['photos'].length; i++) {
      newPhotos
        .push({
          userOrCompanayId: userId,
          name: (req as IMulterRequest).files['photos'][i].originalname,
          url: photoDirectory + (req as IMulterRequest).files['photos'][i].filename,
          type: (req as IMulterRequest).files['photos'][i].mimetype,
          version: '',
          size: (req as IMulterRequest).files['photos'][i].size,
          storageDir: photoDirectory
        });
    }
  }

  if ((req as IMulterRequest).files['videos']?.length) {
    for (let i = 0; i < (req as IMulterRequest).files['videos'].length; i++) {
      newVideos
        .push({
          userOrCompanayId: userId,
          name: (req as IMulterRequest).files['videos'][i].originalname,
          url: videoDirectory + (req as IMulterRequest).files['videos'][i].filename,
          type: (req as IMulterRequest).files['videos'][i].mimetype,
          version: '',
          storageDir: videoDirectory,
          size: (req as IMulterRequest).files['videos'][i].size
        });
    }
  }

  if ((req as IMulterRequest).files['videothumbnail']?.length) {
    thumbnail = {
      userOrCompanayId: userId,
      name: (req as IMulterRequest).files['videothumbnail'][0].originalname,
      url: photoDirectory + (req as IMulterRequest).files['videothumbnail'][0].filename,
      type: (req as IMulterRequest).files['videothumbnail'][0].mimetype,
      version: '',
      storageDir: photoDirectory,
      size: (req as IMulterRequest).files['videothumbnail'][0].size
    };
    parsed.thumbnail = thumbnail;
  }

  parsed.newPhotos = newPhotos;
  parsed.newVideos = newVideos;
  req.body = parsed;
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
  const parsed = req.body;
  if (!parsed) {
    return next();
  }
  if (parsed.newPhotos) {
    const promises = parsed.newPhotos
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .map((value: IfileMeta) => new Promise(async(resolve) => {
        const newFileMeta = new fileMeta(value);
        let savedErr: string;
        const newSaved = await newFileMeta.save().catch(err => {
          fsControllerLogger.error('save error', err);
          savedErr = err;
          return null;
        });
        if (savedErr) {
          return res.status(500).send({ success: false });
        }
        resolve(newSaved);
      }));
    parsed.newPhotos = await Promise.all(promises);
  }

  if (parsed.profilePic) {
    const newFileMeta = new fileMeta(parsed.profilePic);
    let savedErr: string;
    const newSaved = await newFileMeta.save().catch(err => {
      fsControllerLogger.error('save error', err);
      savedErr = err;
      return null;
    });
    if (savedErr) {
      return res.status(500).send({ success: false });
    }
    parsed.profilePic = newSaved._id;
    parsed.newPhotos.push(newSaved);
  }

  if (parsed.coverPic) {
    const newFileMeta = new fileMeta(parsed.profilePic);
    let savedErr: string;
    const newSaved = await newFileMeta.save().catch(err => {
      fsControllerLogger.error('save error', err);
      savedErr = err;
      return null;
    });
    if (savedErr) {
      return res.status(500).send({ success: false });
    }
    parsed.coverPic = newSaved._id;
    parsed.newPhotos.push(newSaved);
  }

  if (parsed.thumbnail) {
    const newFileMeta = new fileMeta(parsed.thumbnail);
    let savedErr: string;
    const newSaved = await newFileMeta.save().catch(err => {
      fsControllerLogger.error('save error', err);
      savedErr = err;
      return null;
    });
    if (savedErr) {
      return res.status(500).send({ success: false });
    }
    parsed.thumbnail = newSaved._id;
    parsed.newPhotos.push(newSaved);
  }

  if (parsed.newPhotos) {
    const mappedParsedFiles = parsed.newPhotos.map((value: IfileMeta) => value._id);
    parsed.newPhotos = mappedParsedFiles;
  }
  req.body = parsed; // newPhotos are strings of ids
  return next();
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

export const deleteAllFiles = async(filesWithDir: IfileMeta[]) => {
  if (filesWithDir && !filesWithDir.length) {
    // return res.status(401).send({ error: 'unauthorised' }); // TODO better catch
  }
  const ids = filesWithDir.map((value/** : Ifilewithdir*/) => value._id);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  await fileMeta.deleteMany({ _id: { $in: ids } });

  if (filesWithDir && filesWithDir.length) {
    const promises = filesWithDir
      .map((value/** : Ifilewithdir*/) => new Promise(resolve => {
        fsControllerLogger.debug('deleting file', value.url);
        const absolutepath = envConfig.absolutepath;
        const nowpath = path
          .join(`${absolutepath}${value.url}`);
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
  return true;
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
  await deleteAllFiles(filesWithDir);
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
  const absolutepath = envConfig.absolutepath;
  const fileLocation = path.join(`${absolutepath}${filename}`, filename);
  return res.download(fileLocation, filename);
};

/**
 * Returns a lazy function that sends a success response with status code 200 and a JSON body.
 * @param req - The request object.
 * @param res - The response object.
 */
export const returnLazyFn = (req, res) => res.status(200).send({ success: true });
