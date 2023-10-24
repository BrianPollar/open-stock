"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyObjectIds = exports.verifyObjectId = void 0;
// This function imports the `Types` module from `mongoose`.
const mongoose_1 = require("mongoose");
// This function imports the `getLogger()` function from `log4js`.
const log4js_1 = require("log4js");
// This function creates a verifyLogger named `constants/verify`.
const verifyLogger = (0, log4js_1.getLogger)('constants/verify');
// This function exports a function that verifies an ObjectID.
//
// **Parameters:**
//
// * `val`: The ObjectID to be verified.
//*
// **Returns:**
//
// A boolean indicating whether the ObjectID is valid.
/** */
const verifyObjectId = (val) => {
    // Log the `val` parameter.
    verifyLogger.info('val for verifyObjectId', val);
    // Check if the `val` parameter is a valid ObjectID.
    const isValid = mongoose_1.Types.ObjectId.isValid(val);
    // Log the `isValid` variable.
    verifyLogger.debug('isValid from verifyObjectId', isValid);
    // If the `val` parameter is not a valid ObjectID, then return `false`.
    if (!isValid) {
        return false;
    }
    // Create a new ObjectID from the `val` parameter.
    const objectId = new mongoose_1.Types.ObjectId(val);
    // Check if the string representation of the new ObjectID is equal to the `val` parameter.
    return objectId.toString() === val;
};
exports.verifyObjectId = verifyObjectId;
/** */
const verifyObjectIds = (vals) => {
    const foundInvalid = vals.find(id => {
        const isValid = (0, exports.verifyObjectId)(id);
        if (isValid) {
            return id;
        }
    });
    return Boolean(foundInvalid);
};
exports.verifyObjectIds = verifyObjectIds;
//# sourceMappingURL=verify.constant.js.map