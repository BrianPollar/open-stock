"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnLazyFn = exports.getOneFile = exports.deleteFiles = exports.updateFiles = exports.saveMetaToDb = exports.appendBody = exports.uploadFiles = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/prefer-for-of */
const fs = tslib_1.__importStar(require("fs"));
const log4js_1 = require("log4js");
const multer_1 = tslib_1.__importDefault(require("multer"));
const path = tslib_1.__importStar(require("path"));
const filestorage_1 = require("./filestorage");
const environment_constant_1 = require("../constants/environment.constant");
const filemeta_model_1 = require("../models/filemeta.model");
const fsControllerLogger = (0, log4js_1.getLogger)('controllers/FsController');
/**
 * Uploads files from the request to the server.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const uploadFiles = (req, res, next) => {
    const makeupload = filestorage_1.upload.fields(filestorage_1.multerFileds);
    makeupload(req, res, function (err) {
        if (err instanceof multer_1.default.MulterError) {
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
exports.uploadFiles = uploadFiles;
/**
 * Appends file metadata to the request body.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
const appendBody = (req, res, next) => {
    if (!req.files) {
        return res.status(404).send({ success: false });
    }
    const { userId, companyId } = req.user;
    const parsed = JSON.parse(req.body.data);
    const newFiles = [];
    let thumbnail;
    let profilePic;
    let coverPic;
    if (req.files['profilePic']?.length) {
        profilePic = {
            userOrCompanayId: userId,
            name: req.files['profilePic'][0].originalname,
            url: '/openphotos/' + req.files['profilePic'][0].filename,
            type: req.files['profilePic'][0].mimetype,
            version: '',
            storageDir: 'openphotos',
            size: req.files['profilePic'][0].size
        };
        parsed.profilePic = profilePic;
    }
    if (req.files['coverPic']?.length) {
        coverPic = {
            userOrCompanayId: userId,
            name: req.files['coverPic'][0].originalname,
            url: '/openphotos/' + req.files['coverPic'][0].filename,
            type: req.files['coverPic'][0].mimetype,
            version: '',
            storageDir: 'openphotos',
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
                url: '/openphotos/' + req.files['photos'][i].filename,
                type: req.files['photos'][i].mimetype,
                version: '',
                size: req.files['photos'][i].size,
                storageDir: 'openphotos'
            });
        }
    }
    if (req.files['videos']?.length) {
        for (let i = 0; i < req.files['videos'].length; i++) {
            newFiles
                .push({
                userOrCompanayId: userId,
                name: req.files['videos'][i].originalname,
                url: '/openvideos/' + req.files['videos'][i].filename,
                type: req.files['videos'][i].mimetype,
                version: '',
                storageDir: 'openvideos',
                size: req.files['videos'][i].size
            });
        }
    }
    if (req.files['videothumbnail']?.length) {
        thumbnail = {
            userOrCompanayId: userId,
            name: req.files['videothumbnail'][0].originalname,
            url: '/openphotos/' + req.files['videothumbnail'][0].filename,
            type: req.files['videothumbnail'][0].mimetype,
            version: '',
            storageDir: 'openphotos',
            size: req.files['videothumbnail'][0].size
        };
        parsed.thumbnail = thumbnail;
    }
    parsed.newFiles = newFiles;
    req.body.parsed = parsed;
    return next();
};
exports.appendBody = appendBody;
/**
 * Saves the metadata to the database.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
const saveMetaToDb = async (req, res, next) => {
    const parsed = req.body.parsed;
    if (!parsed) {
        return next();
    }
    if (parsed.newFiles) {
        const promises = parsed.newFiles
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            .map((value) => new Promise(async (resolve) => {
            const newFileMeta = new filemeta_model_1.fileMeta(value);
            const newSaved = await newFileMeta.save();
            resolve(newSaved);
        }));
        parsed.newFiles = await Promise.all(promises);
    }
    if (parsed.profilePic) {
        const newFileMeta = new filemeta_model_1.fileMeta(parsed.profilePic);
        const newSaved = await newFileMeta.save();
        parsed.profilePic = newSaved;
        parsed.newFiles.push(newSaved);
    }
    if (parsed.coverPic) {
        const newFileMeta = new filemeta_model_1.fileMeta(parsed.profilePic);
        const newSaved = await newFileMeta.save();
        parsed.coverPic = newSaved;
        parsed.newFiles.push(newSaved);
    }
    if (parsed.thumbnail) {
        const newFileMeta = new filemeta_model_1.fileMeta(parsed.thumbnail);
        const newSaved = await newFileMeta.save();
        parsed.thumbnail = newSaved;
        parsed.newFiles.push(newSaved);
    }
    req.body.parsed = parsed;
};
exports.saveMetaToDb = saveMetaToDb;
/**
 * Updates files in the file manager.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
const updateFiles = (req, res, next) => {
    const makeupload = filestorage_1.upload.fields(filestorage_1.multerFileds);
    makeupload(req, res, function (err) {
        if (err instanceof multer_1.default.MulterError) {
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
exports.updateFiles = updateFiles;
/**
 * Deletes files from the server.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A Promise that resolves when the files are deleted.
 */
const deleteFiles = async (req, res, next) => {
    const { filesWithDir } = req.body;
    if (filesWithDir && !filesWithDir.length) {
        // return res.status(401).send({ error: 'unauthorised' }); // TODO better catch
    }
    const ids = filesWithDir.map((value /** : Ifilewithdir*/) => value._id);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await filemeta_model_1.fileMeta.deleteMany({ _id: { $in: ids } });
    if (filesWithDir && filesWithDir.length) {
        const promises = filesWithDir
            .map((value /** : Ifilewithdir*/) => new Promise(resolve => {
            fsControllerLogger.debug('deleting file', value.filename);
            const absolutepath = (0, environment_constant_1.getExpressLocals)(req.app, 'absolutepath');
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
exports.deleteFiles = deleteFiles;
/**
 * Retrieves and downloads a single file.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A download of the specified file.
 */
const getOneFile = (req, res) => {
    const { filename } = req.params;
    fsControllerLogger.debug(`download, file: ${filename}`);
    const absolutepath = (0, environment_constant_1.getExpressLocals)(req.app, 'absolutepath');
    const fileLocation = path.join(`${absolutepath}${filename}`, filename);
    return res.download(fileLocation, filename);
};
exports.getOneFile = getOneFile;
/**
 * Returns a lazy function that sends a success response with status code 200 and a JSON body.
 * @param req - The request object.
 * @param res - The response object.
 */
const returnLazyFn = (req, res) => res.status(200).send({ success: true });
exports.returnLazyFn = returnLazyFn;
//# sourceMappingURL=fs.js.map