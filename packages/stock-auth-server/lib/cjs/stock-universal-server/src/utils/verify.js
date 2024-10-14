"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyObjectIds = exports.verifyObjectId = void 0;
const mongoose_1 = require("mongoose");
const back_logger_1 = require("./back-logger");
// This function exports a function that verifies an ObjectID.
//
// **Parameters:**
//
// * `val`: The ObjectID to be verified.
//*
// **Returns:**
//
// A boolean indicating whether the ObjectID is valid.
/**
 * Validates if a value is a valid ObjectID.
 * @param val - The value to be validated.
 * @returns `true` if the value is a valid ObjectID, `false` otherwise.
 */
const verifyObjectId = (val) => {
    // Log the `val` parameter.
    back_logger_1.mainLogger.info('val for verifyObjectId', val);
    if (!val) {
        back_logger_1.mainLogger.info('no val');
        return false;
    }
    // Check if the `val` parameter is a valid ObjectID.
    const isValid = mongoose_1.Types.ObjectId.isValid(val.toString());
    // Log the `isValid` variable.
    back_logger_1.mainLogger.debug('isValid from verifyObjectId', isValid);
    // If the `val` parameter is not a valid ObjectID, then return `false`.
    if (!isValid) {
        return false;
    }
    // Create a new ObjectID from the `val` parameter.
    const objectId = new mongoose_1.Types.ObjectId(val.toString());
    // Check if the string representation of the new ObjectID is equal to the `val` parameter.
    return objectId.toString() === val;
};
exports.verifyObjectId = verifyObjectId;
/**
 * Checks if an array of values contains valid ObjectIds.

   * @param vals - The array of values to be checked.
 * @returns A boolean indicating whether any invalid ObjectIds were found.
 */
const verifyObjectIds = (vals) => {
    const foundInvalid = vals.find(id => {
        const isValid = (0, exports.verifyObjectId)(id.toString());
        if (isValid) {
            return id;
        }
    });
    return Boolean(foundInvalid);
};
exports.verifyObjectIds = verifyObjectIds;
//# sourceMappingURL=verify.js.map