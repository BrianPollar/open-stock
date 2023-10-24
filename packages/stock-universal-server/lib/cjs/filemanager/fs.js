"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnLazyFn = exports.getOneFile = exports.deleteFiles = exports.updateFiles = exports.appendBody = exports.uploadFiles = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/prefer-for-of */
const fs = tslib_1.__importStar(require("fs"));
const log4js_1 = require("log4js");
const multer_1 = tslib_1.__importDefault(require("multer"));
const path = tslib_1.__importStar(require("path"));
const filestorage_1 = require("./filestorage");
const environment_constant_1 = require("../constants/environment.constant");
const fsControllerLogger = (0, log4js_1.getLogger)('controllers/FsController');
/** */
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
/** */
const appendBody = (req, res, next) => {
    if (!req.files) {
        return res.status(404).send({ success: false });
    }
    const parsed = JSON.parse(req.body.data);
    const newFiles = [];
    let thumbnail;
    if (req.files['photos']?.length) {
        for (let i = 0; i < req.files['photos'].length; i++) {
            newFiles
                .push('/openphotos/' + req.files['photos'][i].filename);
        }
    }
    if (req.files['videos']?.length) {
        for (let i = 0; i < req.files['videos'].length; i++) {
            newFiles
                .push('/openvideos/' + req.files['videos'][i].filename);
        }
    }
    if (req.files['videothumbnail']?.length) {
        thumbnail = '/openphotos/' + req.files['videothumbnail'][0].filename;
        parsed.thumbnail = thumbnail;
    }
    parsed.newFiles = newFiles;
    req.body = parsed;
    return next();
};
exports.appendBody = appendBody;
/** */
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
/** */
const deleteFiles = async (req, res, next) => {
    const { filesWithDir } = req.body;
    if (filesWithDir && !filesWithDir.length) {
        // return res.status(401).send({ error: 'unauthorised' }); // TODO better catch
    }
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
/** */
const getOneFile = (req, res) => {
    const { filename } = req.params;
    fsControllerLogger.debug(`download, file: ${filename}`);
    const absolutepath = (0, environment_constant_1.getExpressLocals)(req.app, 'absolutepath');
    const fileLocation = path.join(`${absolutepath}${filename}`, filename);
    return res.download(fileLocation, filename);
};
exports.getOneFile = getOneFile;
/** */
const returnLazyFn = (req, res) => res.status(200).send({ success: true });
exports.returnLazyFn = returnLazyFn;
//# sourceMappingURL=fs.js.map