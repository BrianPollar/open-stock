/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { Schema } from 'mongoose';
/**
 * Validates if a value is a valid ObjectID.
 * @param val - The value to be validated.
 * @returns `true` if the value is a valid ObjectID, `false` otherwise.
 */
export declare const verifyObjectId: (val: string | Schema.Types.ObjectId) => boolean;
/**
 * Checks if an array of values contains valid ObjectIds.

   * @param vals - The array of values to be checked.
 * @returns A boolean indicating whether any invalid ObjectIds were found.
 */
export declare const verifyObjectIds: (vals: (string | Schema.Types.ObjectId)[]) => boolean;
