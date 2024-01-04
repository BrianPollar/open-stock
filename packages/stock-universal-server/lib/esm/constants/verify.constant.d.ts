import { Types } from 'mongoose';
/**
 * Validates if a value is a valid ObjectID.
 * @param val - The value to be validated.
 * @returns `true` if the value is a valid ObjectID, `false` otherwise.
 */
export declare const verifyObjectId: (val: string | Types.ObjectId) => boolean;
/**
 * Checks if an array of values contains valid ObjectIds.
 * @param companyId - The ID of the company
   * @param vals - The array of values to be checked.
 * @returns A boolean indicating whether any invalid ObjectIds were found.
 */
export declare const verifyObjectIds: (vals: (string | Types.ObjectId)[]) => boolean;
