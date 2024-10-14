"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMongooseErr = exports.stringifyMongooseErr = void 0;
const mongoose_1 = require("mongoose");
const back_logger_1 = require("./back-logger");
/**
 * Converts a Mongoose error object into a string representation.
 * @param errors - The Mongoose error object.
 * @returns A string representation of the Mongoose errors.
 */
const stringifyMongooseErr = (errors) => {
    back_logger_1.mainLogger.info('stringifyMongooseErr', errors);
    const errorsStrArr = Object.keys(errors).map(key => {
        let err = '';
        if (errors[key].kind === 'unique') {
            err = errors[key].message;
        }
        else {
            err = key + ' ' + errors[key].message;
        }
        return err;
    });
    return errorsStrArr.join(', ');
};
exports.stringifyMongooseErr = stringifyMongooseErr;
const handleMongooseErr = (error) => {
    back_logger_1.mainLogger.info('handleMongooseErr', error);
    let err;
    if (error instanceof mongoose_1.Error.ValidationError) {
        err = (0, exports.stringifyMongooseErr)(error.errors);
    }
    else {
        err = `we are having problems connecting to our databases, 
    try again in a while`;
    }
    return { success: false, status: 403, err };
};
exports.handleMongooseErr = handleMongooseErr;
//# sourceMappingURL=mongooseerrors.js.map