import * as fs from 'fs';
import { Types } from 'mongoose';
import path from 'path';
import * as tracer from 'tracer';
// This function creates a verifyLogger named `constants/verify`.
const verifyLogger = tracer.colorConsole({
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
export const verifyObjectId = (val) => {
    // Log the `val` parameter.
    verifyLogger.info('val for verifyObjectId', val);
    if (!val) {
        return false;
    }
    // Check if the `val` parameter is a valid ObjectID.
    const isValid = Types.ObjectId.isValid(val.toString());
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
/**
 * Checks if an array of values contains valid ObjectIds.
 * @param companyId - The ID of the company
   * @param vals - The array of values to be checked.
 * @returns A boolean indicating whether any invalid ObjectIds were found.
 */
export const verifyObjectIds = (vals) => {
    const foundInvalid = vals.find(id => {
        const isValid = verifyObjectId(id);
        if (isValid) {
            return id;
        }
    });
    return Boolean(foundInvalid);
};
//# sourceMappingURL=verify.js.map