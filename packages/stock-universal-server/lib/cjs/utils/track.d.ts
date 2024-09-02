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
import { Isuccess, ItrackDeleted, ItrackEdit, ItrackView, TtrackWhat } from '@open-stock/stock-universal';
import { Types } from 'mongoose';
/**
 * Creates a new track edit in the database.
 *
 * @param trackEdit - The track edit to create. Must contain a `parent` field which is the id of the entity being edited.
 * @returns The saved track edit document.
 */
export declare const createTrackEdit: (trackEdit: ItrackEdit) => Promise<import("mongoose").Document<unknown, {}, import("../models/tracker/track-edit.model").TtrackEdit> & import("mongoose").Document<any, any, any> & ItrackEdit & {
    _id: Types.ObjectId;
}>;
/**
 * Creates a new track view in the database.
 *
 * @param trackView - The track view to create. Must contain a `parent` field which is the id of the entity being viewed.
 * @returns The saved track view document.
 */
export declare const createTrackView: (trackView: ItrackView) => Promise<import("mongoose").Document<unknown, {}, import("../models/tracker/track-view.model").TtrackView> & import("mongoose").Document<any, any, any> & ItrackView & {
    _id: Types.ObjectId;
}>;
/**
 * Creates a new track deleted in the database.
 *
 * @param trackDeleted - The track deleted to create. Must contain a `parent` field which is the id of the entity being deleted.
 * @returns The saved track deleted document.
 */
export declare const createTrackDeleted: (trackDeleted: ItrackDeleted) => Promise<import("mongoose").Document<unknown, {}, import("../models/tracker/track-deleted.model").TtrackDeleted> & import("mongoose").Document<any, any, any> & ItrackDeleted & {
    _id: Types.ObjectId;
}>;
export interface ItrackReturn extends Isuccess {
    trackEdit?: ItrackEdit;
}
/**
 * Creates a new track edit in the database.
 *
 * @param req - The Express request object.
 * @param parent - The id of the entity being edited.
 * @param trackEdit - The track edit data. Must contain a `createdBy` field which is the id of the user performing the edit.
 * @returns The saved track edit document wrapped in an `ItrackReturn` object.
 */
export declare const makeTrackEdit: (req: any, parent: string, trackEdit: ItrackEdit) => Promise<ItrackReturn>;
/**
   * Updates a track edit in the database.
   *
   * @param req - The Express request object.
   * @param parent - The id of the entity being edited.
   * @param trackEdit - The track edit data. Must contain a `createdBy` field which is the id of the user performing the edit.
   * @param userId - The id of the user who is performing the edit.
   * @param trackDataRestore - Whether the edit is a restore of a deleted document.
   * @returns An `ItrackEditReturn` object with the saved track edit data.
   */
export declare const updateTrackEdit: (req: any, parent: string, trackEdit: ItrackEdit, userId: string, trackDataRestore?: boolean) => Promise<ItrackEditReturn>;
/**
 * Deletes a track edit document from the database.
 *
 * @param parent - The id of the parent document.
 * @returns A boolean indicating whether the document was successfully deleted.
 */
export declare const deleteTrackEdit: (parent: string) => Promise<boolean>;
/**
   * Get a track edit by parent id
   * @param req express request
   * @param res express response
   * @returns the track edit document or a 404 if not found
   */
export declare const getTrackEdit: (req: any, res: any) => Promise<any>;
/**
   * Get all track edits
   * @param req express request
   * @param res express response
   * @returns an array of all track edit documents
   */
export declare const getAllTrackEdit: (req: any, res: any) => Promise<any>;
export interface ItrackViewReturn extends Isuccess {
    trackView?: ItrackView;
    updateParent?: boolean;
}
export interface ItrackEditReturn extends Isuccess {
    savedEdit?: ItrackView;
    updateParent?: boolean;
}
/**
   * Creates a new track view document in the database.
   *
   * @param req - The Express request object.
   * @param parent - The id of the entity being viewed.
   * @param trackView - The track view data. Must contain a `collectionName` field which is the name of the collection the entity belongs to.
   * @param userId - The id of the user performing the view.
   * @returns A Promise resolving to an `ItrackViewReturn` object with the saved track view document wrapped in `trackView` if successful.
   */
export declare const makeTrackView: (req: any, parent: string, trackView: ItrackView, userId: string) => Promise<ItrackViewReturn>;
/**
   * Updates a track view document in the database.
   *
   * @param req - The Express request object.
   * @param parent - The id of the entity being viewed.
   * @param userId - The id of the user performing the view.
   * @param collectionName - The collection name of the entity being viewed.
   * @returns A Promise resolving to an `ItrackViewReturn` object with the saved track view document wrapped in `trackView` if successful.
   */
export declare const updateTrackView: (req: any, parent: string, userId: string, collectionName: string) => Promise<ItrackViewReturn>;
/**
   * Delete a track view document by parent id.
   * @param {string} parent - parent id of the document to delete
   * @returns {Promise<boolean>} - true if deletion was successfull, false otherwise
   */
export declare const deleteTrackView: (parent: string) => Promise<boolean>;
/**
   * Get a track view document by parent id.
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @returns {Promise<void>} - sends a response with the track view document if found, otherwise a 404
   */
export declare const getTrackView: (req: any, res: any) => Promise<any>;
/**
   * Get all track view documents
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @returns {Promise<void>} - sends a response with all track view documents
   */
export declare const getAllTrackView: (req: any, res: any) => Promise<any>;
/**
   * Create a track deleted document.
   * @param {ItrackDeleted} trackDeleted - track deleted data
   * @returns {Promise<DocumentType<ItrackDeleted>>} - the saved track deleted document
   */
export declare const makeTrackDeleted: (trackDeleted: ItrackDeleted) => Promise<import("mongoose").Document<unknown, {}, import("../models/tracker/track-deleted.model").TtrackDeleted> & import("mongoose").Document<any, any, any> & ItrackDeleted & {
    _id: Types.ObjectId;
}>;
/**
   * Delete a track deleted document by parent id.
   * @param {string} parent - parent id of the track deleted document
   * @returns {Promise<boolean>} - true if deleted, false if not
   */
export declare const deleteTrackDeleted: (parent: string) => Promise<boolean>;
export declare const getAllTrackDeleted: (req: any, res: any) => Promise<any>;
/**
   * This middleware is used to track user actions on the server.
   * It is called after the user has finished his request.
   * It is used to track the following actions:
   * - trackDataEdit: when the user edits a document
   * - trackDataView: when the user views a document
   * - trackDataRestore: when the user restores a document
   * - trackDataDelete: when the user deletes a document
   * @param {Request} req - express request
   * @param {Response} res - express response
   * @param {NextFunction} next - express next function
   * @returns {Promise<void>} - nothing, sends response
   */
export declare const trackUser: (req: any, res: any, next: any) => void;
/**
 * Adds a parent to the locals object, so that it can be used in the trackMiddleWare to add a trackEntry.
 *
 * @param {Response} res - the express response object
 * @param {string} parent - the parent Id
 * @param {string} collection - the collection name
 * @param {TtrackWhat} trackWhat - what to track, e.g. trackEdit, trackView, trackDeleted
 */
export declare const addParentToLocals: (res: any, parent: string, collection: string, trackWhat: TtrackWhat) => void;
export declare const clearFsFiles: () => void;
export declare const hasValidIdsInRequest: (req: any, res: any, next: any) => any;
/**
   * Checks if the document is deleted by checking if there is a
   * document in the trackDeleted collection with the same id.
   *
   * @function
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A Promise that resolves when the middleware is done.
   */
export declare const isDocDeleted: (req: any, res: any, next: any) => Promise<any>;
export declare const trackRoutes: any;
/**
   * Periodically removes all documents from all collections that have been marked as deleted
   * and have an expireDocAfter date that is older than the configured expireDocAfterSeconds.
   * @returns {Promise<void>} - A promise that resolves when all documents have been removed.
   */
export declare const periodicRemove: () => Promise<void>;
export declare const deleteLingeringFiles: () => Promise<void>;
/**
   * Periodically cleans up files that are marked as deleted and have expired.
   * Automatically called by the periodic task manager.
   * @returns {Promise<void>}
   */
export declare const autoCleanFiles: () => Promise<void>;
