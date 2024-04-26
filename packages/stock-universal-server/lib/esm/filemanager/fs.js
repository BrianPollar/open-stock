import * as fs from 'fs';
import { getLogger } from 'log4js';
import multer from 'multer';
import * as path from 'path';
import { fileMeta } from '../models/filemeta.model';
import { envConfig } from '../stock-universal-local';
import { multerFileds, upload } from './filestorage';
const fsControllerLogger = getLogger('controllers/FsController');
/**
 * Uploads files from the request to the server.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const uploadFiles = (req, res, next) => {
    console.log('uploadFiles');
    const makeupload = upload.fields(multerFileds);
    makeupload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            fsControllerLogger.error('Multer UPLOAD ERROR', err);
            return res.status(500).send({ success: false });
        }
        else if (err) {
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
export const appendBody = (req, res, next) => {
    if (!req.files) {
        return res.status(404).send({ success: false });
    }
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const videoDirectory = path.join(envConfig.videoDirectory + '/' + queryId + '/');
    const photoDirectory = path.join(envConfig.photoDirectory + '/' + queryId + '/');
    const { userId } = req.user;
    const parsed = JSON.parse(req.body.data);
    const newFiles = [];
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
    }
    if (req.files['photos']?.length) {
        for (let i = 0; i < req.files['photos'].length; i++) {
            newFiles
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
            newFiles
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
    parsed.newFiles = newFiles;
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
    if (parsed.newFiles) {
        const promises = parsed.newFiles
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            .map((value) => new Promise(async (resolve) => {
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
        const mappedParsedFiles = parsed.newFiles.map((value) => value._id);
        parsed.newFiles = mappedParsedFiles;
    }
    req.body = parsed; // newFiles are strings of ids
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
            fsControllerLogger.error('Multer UPLOAD ERROR', err);
            return res.status(404).send({ success: false });
        }
        else if (err) {
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
export const deleteFiles = async (req, res, next) => {
    const { filesWithDir } = req.body;
    if (filesWithDir && !filesWithDir.length) {
        // return res.status(401).send({ error: 'unauthorised' }); // TODO better catch
    }
    const ids = filesWithDir.map((value /** : Ifilewithdir*/) => value._id);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await fileMeta.deleteMany({ _id: { $in: ids } });
    if (filesWithDir && filesWithDir.length) {
        const promises = filesWithDir
            .map((value /** : Ifilewithdir*/) => new Promise(resolve => {
            fsControllerLogger.debug('deleting file', value.filename);
            const absolutepath = envConfig.absolutepath;
            const nowpath = path
                .resolve(`${absolutepath}${value.filename}`);
            fs.unlink(nowpath, (err) => {
                if (err) {
                    fsControllerLogger.error('error while deleting file', err);
                    resolve(false);
                }
                else {
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
export const getOneFile = (req, res) => {
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
//# sourceMappingURL=fs.js.map