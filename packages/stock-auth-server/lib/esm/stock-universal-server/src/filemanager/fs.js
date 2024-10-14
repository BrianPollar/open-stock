/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { removeBackground } from '@imgly/background-removal-node';
import * as fs from 'fs';
import { Error } from 'mongoose';
import multer from 'multer';
import * as path from 'path';
import { fileMeta } from '../models/filemeta.model';
import { stockUniversalConfig } from '../stock-universal-local';
import { mainLogger } from '../utils/back-logger';
import { multerFileds, upload } from './filestorage';
/**
 * Uploads files from the request to the server.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const uploadFiles = (req, res, next) => {
    const makeupload = upload.fields(multerFileds);
    makeupload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            mainLogger.error('Multer UPLOAD ERROR', err);
            return res.status(500).send({ success: false });
        }
        else if (err) {
            // An unknown error occurred when uploading.
            mainLogger.error('UNKWON UPLOAD ERROR', err);
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
export const appendBody = (req, res, next) => {
    if (!req.files) {
        return res.status(404).send({ success: false });
    }
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { companyId } = req.user;
    const videoDirectory = path.join(stockUniversalConfig.envCfig.videoDirectory + '/' + companyId + '/');
    const photoDirectory = path.join(stockUniversalConfig.envCfig.photoDirectory + '/' + companyId + '/');
    const { userId } = req.user;
    const parsed = JSON.parse(req.body.data);
    const newPhotos = [];
    const newVideos = [];
    let thumbnail;
    let profilePic;
    let coverPic;
    if (req.files['profilePic']?.length) {
        profilePic = {
            userOrCompanayId: userId,
            name: req.files['profilePic'][0].originalname,
            url: photoDirectory + req.files['profilePic'][0].filename,
            type: req.files['profilePic'][0].mimetype,
            version: '',
            storageDir: photoDirectory,
            size: req.files['profilePic'][0].size
        };
        parsed.profilePic = profilePic;
        newPhotos.push(profilePic);
    }
    if (req.files['coverPic']?.length) {
        coverPic = {
            userOrCompanayId: userId,
            name: req.files['coverPic'][0].originalname,
            url: photoDirectory + req.files['coverPic'][0].filename,
            type: req.files['coverPic'][0].mimetype,
            version: '',
            storageDir: photoDirectory,
            size: req.files['coverPic'][0].size
        };
        parsed.coverPic = coverPic;
        newPhotos.push(coverPic);
    }
    if (req.files['photos']?.length) {
        for (let i = 0; i < req.files['photos'].length; i++) {
            newPhotos
                .push({
                userOrCompanayId: userId,
                name: req.files['photos'][i].originalname,
                url: photoDirectory + req.files['photos'][i].filename,
                type: req.files['photos'][i].mimetype,
                version: '',
                size: req.files['photos'][i].size,
                storageDir: photoDirectory
            });
        }
    }
    if (req.files['videos']?.length) {
        for (let i = 0; i < req.files['videos'].length; i++) {
            newVideos
                .push({
                userOrCompanayId: userId,
                name: req.files['videos'][i].originalname,
                url: videoDirectory + req.files['videos'][i].filename,
                type: req.files['videos'][i].mimetype,
                version: '',
                storageDir: videoDirectory,
                size: req.files['videos'][i].size
            });
        }
    }
    if (req.files['videothumbnail']?.length) {
        thumbnail = {
            userOrCompanayId: userId,
            name: req.files['videothumbnail'][0].originalname,
            url: photoDirectory + req.files['videothumbnail'][0].filename,
            type: req.files['videothumbnail'][0].mimetype,
            version: '',
            storageDir: photoDirectory,
            size: req.files['videothumbnail'][0].size
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
export const saveMetaToDb = async (req, res, next) => {
    const parsed = req.body;
    if (!parsed) {
        return next();
    }
    if (parsed.newPhotos) {
        const promises = parsed.newPhotos
            .map((value) => new Promise(async (resolve, reject) => {
            const newFileMeta = new fileMeta(value);
            const newSaved = await newFileMeta.save().catch((err) => {
                mainLogger.error('save error', err);
                reject(err);
            });
            resolve(newSaved);
        }));
        const allResolved = await Promise.all(promises).catch(err => {
            mainLogger.error('save error', err);
            return null;
        });
        if (!allResolved) {
            return res.status(500).send({ success: false });
        }
        parsed.newPhotos = allResolved;
    }
    /* if (parsed.profilePic) {
      const newFileMeta = new fileMeta(parsed.profilePic);
      let savedErr: string;
      const newSaved = await newFileMeta.save().catch(err => {
        mainLogger.error('save error', err);
        savedErr = err;
        return null;
      });
      if (savedErr) {
        return res.status(500).send({ success: false });
      }
      parsed.profilePic = newSaved._id;
      parsed.newPhotos.push(newSaved);
    } */
    /* if (parsed.coverPic) {
      const newFileMeta = new fileMeta(parsed.profilePic);
      let savedErr: string;
      const newSaved = await newFileMeta.save().catch(err => {
        mainLogger.error('save error', err);
        savedErr = err;
        return null;
      });
      if (savedErr) {
        return res.status(500).send({ success: false });
      }
      parsed.coverPic = newSaved._id;
      parsed.newPhotos.push(newSaved);
    } */
    if (parsed.thumbnail) {
        const newFileMeta = new fileMeta(parsed.thumbnail);
        const newSaved = await newFileMeta.save().catch((err) => {
            mainLogger.error('save error', err);
            return err;
        });
        if (newSaved instanceof Error) {
            return res.status(500).send({ success: false });
        }
        parsed.thumbnail = newSaved._id;
        parsed.newPhotos?.push(newSaved);
    }
    if (parsed.newPhotos) {
        const mappedParsedFiles = (parsed.newPhotos).map((value) => value._id?.toString())
            .filter(value => value);
        parsed.newPhotos = mappedParsedFiles;
    }
    req.body = parsed; // newPhotos are strings of _ids
    return next();
};
/**
 * Updates files in the file manager.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const updateFiles = (req, res, next) => {
    const makeupload = upload.fields(multerFileds);
    makeupload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            mainLogger.error('Multer UPLOAD ERROR', err);
            return res.status(404).send({ success: false });
        }
        else if (err) {
            // An unknown error occurred when uploading.
            mainLogger.error('UNKWON UPLOAD ERROR', err);
            return res.status(404).send({ success: false });
        }
        return next();
    });
};
// TODO batch file delete after doc expires
export const deleteAllFiles = async (filesWithDir, directlyRemove = false) => {
    if (filesWithDir && !filesWithDir.length) {
        // return res.status(401).send({ error: 'unauthorised' }); // TODO better catch
    }
    const _ids = filesWithDir.map((value /** : Ifilewithdir */) => value._id);
    // await fileMeta.deleteMany({ _id: { $in: _ids } });
    if (!directlyRemove) {
        await fileMeta.updateMany({ _id: { $in: _ids } }, { $set: { isDeleted: true } });
    }
    else {
        await fileMeta.deleteMany({ _id: { $in: _ids } });
    }
    if (filesWithDir && filesWithDir.length && directlyRemove) {
        const promises = filesWithDir
            .map((value /** : Ifilewithdir */) => new Promise(resolve => {
            mainLogger.debug('deleting file', value.url);
            const absolutepath = stockUniversalConfig.envCfig.absolutepath;
            const nowpath = path
                .join(`${absolutepath}${value.url}`);
            fs.unlink(nowpath, (err) => {
                if (err) {
                    mainLogger.error('error while deleting file', err);
                    resolve(false);
                }
                else {
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
export const deleteFiles = (directlyRemove = false) => {
    return async (req, res, next) => {
        const { filesWithDir } = req.body;
        await deleteAllFiles(filesWithDir, directlyRemove);
        return next();
    };
};
/**
 * Retrieves and downloads a single file.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A download of the specified file.
 */
export const getOneFile = (req, res) => {
    const { filename } = req.params;
    mainLogger.debug(`download, file: ${filename}`);
    const absolutepath = stockUniversalConfig.envCfig.absolutepath;
    const fileLocation = path.join(`${absolutepath}${filename}`, filename);
    return res.download(fileLocation, filename);
};
/**
 * Returns a lazy function that sends a success response with status code 200 and a JSON body.
 * @param req - The request object.
 * @param res - The response object.
 */
export const returnLazyFn = (req, res) => res.status(200).send({ success: true });
export const removeBg = (imageSrc) => {
    return new Promise((resolve, reject) => {
        const absolutepath = stockUniversalConfig.envCfig.absolutepath;
        const fileLocation = path.join(`${absolutepath}${imageSrc}`);
        const config = {
            output: {
                type: 'mask'
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
        };
        removeBackground(fileLocation, config).then(async (blob) => {
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFile(fileLocation, buffer, {}, (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                mainLogger.debug('files saved');
                resolve(imageSrc);
            });
        });
    });
};
//# sourceMappingURL=fs.js.map