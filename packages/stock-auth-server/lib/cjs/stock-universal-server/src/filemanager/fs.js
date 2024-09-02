"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBg = exports.returnLazyFn = exports.getOneFile = exports.deleteFiles = exports.deleteAllFiles = exports.updateFiles = exports.saveMetaToDb = exports.appendBody = exports.uploadFiles = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/prefer-for-of */
const background_removal_node_1 = require("@imgly/background-removal-node");
const fs = tslib_1.__importStar(require("fs"));
const multer_1 = tslib_1.__importDefault(require("multer"));
const path = tslib_1.__importStar(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const filemeta_model_1 = require("../models/filemeta.model");
const stock_universal_local_1 = require("../stock-universal-local");
const filestorage_1 = require("./filestorage");
const fsControllerLogger = tracer.colorConsole({
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
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const videoDirectory = path.join(stock_universal_local_1.stockUniversalConfig.envCfig.videoDirectory + '/' + queryId + '/');
    const photoDirectory = path.join(stock_universal_local_1.stockUniversalConfig.envCfig.photoDirectory + '/' + queryId + '/');
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
exports.appendBody = appendBody;
/**
 * Saves the metadata to the database.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
const saveMetaToDb = async (req, res, next) => {
    const parsed = req.body;
    if (!parsed) {
        return next();
    }
    if (parsed.newPhotos) {
        const promises = parsed.newPhotos
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            .map((value) => new Promise(async (resolve) => {
            const newFileMeta = new filemeta_model_1.fileMeta(value);
            let savedErr;
            // await removeBg(value.url);
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
    /* if (parsed.profilePic) {
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
    } */
    /* if (parsed.coverPic) {
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
    } */
    if (parsed.thumbnail) {
        const newFileMeta = new filemeta_model_1.fileMeta(parsed.thumbnail);
        let savedErr;
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
        const mappedParsedFiles = parsed.newPhotos.map((value) => value._id.toString());
        parsed.newPhotos = mappedParsedFiles;
    }
    req.body = parsed; // newPhotos are strings of ids
    return next();
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
// TODO batch file delete after doc expires
const deleteAllFiles = async (filesWithDir, directlyRemove = false) => {
    if (filesWithDir && !filesWithDir.length) {
        // return res.status(401).send({ error: 'unauthorised' }); // TODO better catch
    }
    const ids = filesWithDir.map((value /** : Ifilewithdir */) => value._id);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // await fileMeta.deleteMany({ _id: { $in: ids } });
    if (!directlyRemove) {
        await filemeta_model_1.fileMeta.updateMany({ _id: { $in: ids } }, { $set: { isDeleted: true } });
    }
    else {
        await filemeta_model_1.fileMeta.deleteMany({ _id: { $in: ids } });
    }
    if (filesWithDir && filesWithDir.length && directlyRemove) {
        const promises = filesWithDir
            .map((value /** : Ifilewithdir */) => new Promise(resolve => {
            fsControllerLogger.debug('deleting file', value.url);
            const absolutepath = stock_universal_local_1.stockUniversalConfig.envCfig.absolutepath;
            const nowpath = path
                .join(`${absolutepath}${value.url}`);
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
    return true;
};
exports.deleteAllFiles = deleteAllFiles;
/**
 * Deletes files from the server.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A Promise that resolves when the files are deleted.
 */
const deleteFiles = (directlyRemove = false) => {
    return async (req, res, next) => {
        const { filesWithDir } = req.body;
        await (0, exports.deleteAllFiles)(filesWithDir, directlyRemove);
        return next();
    };
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
    const absolutepath = stock_universal_local_1.stockUniversalConfig.envCfig.absolutepath;
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
const removeBg = (imageSrc) => {
    return new Promise((resolve, reject) => {
        const absolutepath = stock_universal_local_1.stockUniversalConfig.envCfig.absolutepath;
        const fileLocation = path.join(`${absolutepath}${imageSrc}`);
        const config = {
            output: {
                type: 'mask'
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
        };
        (0, background_removal_node_1.removeBackground)(fileLocation, config).then(async (blob) => {
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFile(fileLocation, buffer, {}, (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                fsControllerLogger.debug('files saved');
                resolve(imageSrc);
            });
        });
    });
};
exports.removeBg = removeBg;
//# sourceMappingURL=fs.js.map