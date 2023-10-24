"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.multerFileds = void 0;
const tslib_1 = require("tslib");
// This function imports the `fs-extra` module.
const fse = tslib_1.__importStar(require("fs-extra"));
// This function imports the `getLogger()` function from `log4js`.
const log4js_1 = require("log4js");
// This function imports the `multer` module.
const multer_1 = tslib_1.__importDefault(require("multer"));
// This function imports the `path` module.
const path = tslib_1.__importStar(require("path"));
// This function imports the `makeRandomString()` function from `@open-stock/stock-universal`.
const stock_universal_1 = require("@open-stock/stock-universal");
// This function imports the `getExpressLocals()` function from `..constants/environment.constant`.
const environment_constant_1 = require("../constants/environment.constant");
// This function creates a fileStorageLogger named `controllers/FileStorage`.
const fileStorageLogger = (0, log4js_1.getLogger)('controllers/FileStorage');
// This array defines the fields that Multer will use to upload files.
/** */
exports.multerFileds = [
    { name: 'photos', maxCount: 6 },
    { name: 'videos', maxCount: 2 },
    { name: 'videothumbnail', maxCount: 2 }
];
// This function defines the storage strategy for Multer.
const rudimentaryStorage = multer_1.default.diskStorage({
    // This function gets the directory for the file based on its MIME type.
    destination(req, file, cb) {
        const videoDirectory = (0, environment_constant_1.getExpressLocals)(req.app, 'videoDirectory');
        const photoDirectory = (0, environment_constant_1.getExpressLocals)(req.app, 'photoDirectory');
        const mimeType = file.mimetype;
        fileStorageLogger.debug('rudimentaryStorage - mimeType: ', mimeType);
        let storageDir;
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
    filename(req, file, cb) {
        const mimeType = file.mimetype;
        let extName;
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
        cb(null, 'FILE_' + (0, stock_universal_1.makeRandomString)(11, 'combined') + extName);
        // cb(null, 'PHOTO_' + makeRandomString(11) + path.extname(file.originalname));
    }
});
// const upload = multer({ rudimentaryStorage });
/** */
exports.upload = (0, multer_1.default)({ storage: rudimentaryStorage });
//# sourceMappingURL=filestorage.js.map