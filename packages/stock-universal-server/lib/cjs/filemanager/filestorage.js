"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rudimentaryStorage = exports.upload = exports.multerFileds = void 0;
const tslib_1 = require("tslib");
const stock_universal_1 = require("@open-stock/stock-universal");
const fs = tslib_1.__importStar(require("fs"));
const fs_extra_1 = require("fs-extra");
const multer_1 = tslib_1.__importDefault(require("multer"));
const path = tslib_1.__importStar(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const stock_universal_local_1 = require("../stock-universal-local");
// This function creates a fileStorageLogger named `controllers/FileStorage`.
const fileStorageLogger = tracer.colorConsole({
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
// This array defines the fields that Multer will use to upload files.
/**
 * Array of multer fields for file storage.
 * Each field specifies the name and maximum count of files that can be uploaded.
 */
exports.multerFileds = [
    { name: 'photos', maxCount: 6 },
    { name: 'videos', maxCount: 2 },
    { name: 'videothumbnail', maxCount: 2 }
];
// This function defines the storage strategy for Multer.
/**
 * Multer disk storage configuration for rudimentary file storage.
 * This storage configuration determines the destination directory and filename for uploaded files based on their MIME type.
 * @remarks
 * The destination directory is determined by the MIME type of the file. If the MIME type is an image, the file will be stored in the photoDirectory. If the MIME type is a video, the file will be stored in the videoDirectory.
 * The filename is generated based on the MIME type and a random string.
 */
const rudimentaryStorage = multer_1.default.diskStorage({
    // This function gets the directory for the file based on its MIME type.
    destination(req, file, cb) {
        const { companyId } = req.user;
        const { companyIdParam } = req.params;
        const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
        const videoDirectory = stock_universal_local_1.envConfig.absolutepath + '/' + stock_universal_local_1.envConfig.videoDirectory + '/' + queryId;
        const photoDirectory = stock_universal_local_1.envConfig.absolutepath + '/' + stock_universal_local_1.envConfig.photoDirectory + '/' + queryId;
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
        (0, fs_extra_1.mkdir)(storageDir, { recursive: true }, (err) => {
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
exports.rudimentaryStorage = rudimentaryStorage;
// const upload = multer({ rudimentaryStorage });
/**
 * Uploads a file using multer and the specified storage.
 * @param multerOptions The options for multer.
 * @returns A multer instance for file uploading.
 */
exports.upload = (0, multer_1.default)({ storage: rudimentaryStorage });
//# sourceMappingURL=filestorage.js.map