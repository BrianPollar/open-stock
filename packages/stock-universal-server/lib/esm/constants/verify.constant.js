// This function imports the `Types` module from `mongoose`.
import { Types } from 'mongoose';
// This function imports the `getLogger()` function from `log4js`.
import { getLogger } from 'log4js';
// This function creates a verifyLogger named `constants/verify`.
const verifyLogger = getLogger('constants/verify');
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
export const verifyObjectId = (val) => {
    // Log the `val` parameter.
    verifyLogger.info('val for verifyObjectId', val);
    // Check if the `val` parameter is a valid ObjectID.
    const isValid = Types.ObjectId.isValid(val);
    // Log the `isValid` variable.
    verifyLogger.debug('isValid from verifyObjectId', isValid);
    // If the `val` parameter is not a valid ObjectID, then return `false`.
    if (!isValid) {
        return false;
    }
    // Create a new ObjectID from the `val` parameter.
    const objectId = new Types.ObjectId(val);
    // Check if the string representation of the new ObjectID is equal to the `val` parameter.
    return objectId.toString() === val;
};
/** */
export const verifyObjectIds = (vals) => {
    const foundInvalid = vals.find(id => {
        const isValid = verifyObjectId(id);
        if (isValid) {
            return id;
        }
    });
    return Boolean(foundInvalid);
};
//# sourceMappingURL=verify.constant.js.map