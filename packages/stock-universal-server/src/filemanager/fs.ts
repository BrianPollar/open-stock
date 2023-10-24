/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/prefer-for-of */
import * as fs from 'fs';
import { getLogger } from 'log4js';
import multer from 'multer';
import * as path from 'path';
import { IMulterRequest, multerFileds, upload } from './filestorage';
import { getExpressLocals } from '../constants/environment.constant';
const fsControllerLogger = getLogger('controllers/FsController');

/** */
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

/** */
export const appendBody = (
  req,
  res,
  next
) => {
  if (!(req as IMulterRequest).files) {
    return res.status(404).send({ success: false });
  }
  const parsed = JSON.parse(req.body.data);
  const newFiles: string[] = [];
  let thumbnail: string;

  if ((req as IMulterRequest).files['photos']?.length) {
    for (let i = 0; i < (req as IMulterRequest).files['photos'].length; i++) {
      newFiles
        .push('/openphotos/' + (req as IMulterRequest).files['photos'][i].filename);
    }
  }

  if ((req as IMulterRequest).files['videos']?.length) {
    for (let i = 0; i < (req as IMulterRequest).files['videos'].length; i++) {
      newFiles
        .push('/openvideos/' + (req as IMulterRequest).files['videos'][i].filename);
    }
  }

  if ((req as IMulterRequest).files['videothumbnail']?.length) {
    thumbnail = '/openphotos/' + (req as IMulterRequest).files['videothumbnail'][0].filename;
    parsed.thumbnail = thumbnail;
  }


  parsed.newFiles = newFiles;
  req.body = parsed;
  return next();
};

/** */
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

/** */
export const deleteFiles = async(
  req,
  res,
  next) => {
  const { filesWithDir } = req.body;
  if (filesWithDir && !filesWithDir.length) {
    // return res.status(401).send({ error: 'unauthorised' }); // TODO better catch
  }
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

/** */
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

/** */
export const returnLazyFn = (req, res) => res.status(200).send({ success: true });
