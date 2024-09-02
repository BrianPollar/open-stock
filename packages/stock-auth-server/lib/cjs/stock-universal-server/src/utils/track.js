"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoCleanFiles = exports.deleteLingeringFiles = exports.periodicRemove = exports.trackRoutes = exports.isDocDeleted = exports.hasValidIdsInRequest = exports.clearFsFiles = exports.addParentToLocals = exports.trackUser = exports.getAllTrackDeleted = exports.deleteTrackDeleted = exports.makeTrackDeleted = exports.getAllTrackView = exports.getTrackView = exports.deleteTrackView = exports.updateTrackView = exports.makeTrackView = exports.getAllTrackEdit = exports.getTrackEdit = exports.deleteTrackEdit = exports.updateTrackEdit = exports.makeTrackEdit = exports.createTrackDeleted = exports.createTrackView = exports.createTrackEdit = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const mongoose_1 = require("mongoose");
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const fs_1 = require("../filemanager/fs");
const filemeta_model_1 = require("../models/filemeta.model");
const track_deleted_model_1 = require("../models/tracker/track-deleted.model");
const track_edit_model_1 = require("../models/tracker/track-edit.model");
const track_view_model_1 = require("../models/tracker/track-view.model");
const general_1 = require("../query/general");
const stock_universal_local_1 = require("../stock-universal-local");
const database_1 = require("./database");
const expressrouter_1 = require("./expressrouter");
const offsetlimitrelegator_1 = require("./offsetlimitrelegator");
const verify_1 = require("./verify");
const trackerLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
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
/**
 * Creates a new track edit in the database.
 *
 * @param trackEdit - The track edit to create. Must contain a `parent` field which is the id of the entity being edited.
 * @returns The saved track edit document.
 */
const createTrackEdit = async (trackEdit) => {
    trackerLogger.info('createTrackEdit, trackEdit', trackEdit);
    const newTrackEdit = new track_edit_model_1.trackEditMain(trackEdit);
    const saved = await newTrackEdit.save();
    return saved;
};
exports.createTrackEdit = createTrackEdit;
/**
 * Creates a new track view in the database.
 *
 * @param trackView - The track view to create. Must contain a `parent` field which is the id of the entity being viewed.
 * @returns The saved track view document.
 */
const createTrackView = async (trackView) => {
    trackerLogger.info('createTrackView, ', trackView);
    const newTrackView = new track_view_model_1.trackViewMain(trackView);
    const saved = await newTrackView.save();
    return saved;
};
exports.createTrackView = createTrackView;
/**
 * Creates a new track deleted in the database.
 *
 * @param trackDeleted - The track deleted to create. Must contain a `parent` field which is the id of the entity being deleted.
 * @returns The saved track deleted document.
 */
const createTrackDeleted = async (trackDeleted) => {
    trackerLogger.info('createTrackDeleted, ', trackDeleted);
    const newTrackDeleted = new track_deleted_model_1.trackDeletedMain(trackDeleted);
    const saved = await newTrackDeleted.save();
    return saved;
};
exports.createTrackDeleted = createTrackDeleted;
/**
 * Creates a new track edit in the database.
 *
 * @param req - The Express request object.
 * @param parent - The id of the entity being edited.
 * @param trackEdit - The track edit data. Must contain a `createdBy` field which is the id of the user performing the edit.
 * @returns The saved track edit document wrapped in an `ItrackReturn` object.
 */
const makeTrackEdit = async (req, parent, trackEdit) => {
    trackerLogger.info('parent ', parent);
    const isValid = (0, verify_1.verifyObjectId)(parent);
    if (!isValid) {
        return { success: false };
    }
    const created = await (0, exports.createTrackEdit)({
        parent,
        createdBy: trackEdit.createdBy,
        users: [{
                _id: trackEdit.createdBy,
                createdAt: new Date().toString(),
                state: 'create',
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                deviceInfo: req.headers.host
            }],
        collectionName: trackEdit.collectionName
    });
    trackerLogger.debug('makeTrackEdit, created', created);
    return { success: true, trackEdit: created };
};
exports.makeTrackEdit = makeTrackEdit;
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
const updateTrackEdit = async (req, parent, trackEdit, userId, trackDataRestore = false) => {
    trackerLogger.info('updateTrackEdit, parent ', parent);
    trackerLogger.info('updateTrackEdit, userId ', userId);
    trackerLogger.info('updateTrackEdit, trackDataRestore ', trackDataRestore);
    const isValid = (0, verify_1.verifyObjectId)(parent);
    if (!isValid) {
        return { success: false };
    }
    let found = await track_edit_model_1.trackEditLean.findOne({ parent }).lean();
    const users = found?.users || [];
    let state = trackEdit?.deletedBy ? 'delete' : 'update';
    if (trackDataRestore) {
        state = 'restore';
    }
    if (trackEdit.deletedBy) {
        state = 'delete';
    }
    let updateParent = false;
    if (!found) {
        found = await (0, exports.createTrackEdit)({
            parent,
            users: [],
            collectionName: trackEdit.collectionName
        });
        if (state !== 'delete') {
            state = 'create';
        }
        updateParent = true;
    }
    trackerLogger.debug('updateTrackEdit, state ', state);
    users.push({
        _id: userId,
        createdAt: new Date().toString(),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        state,
        deviceInfo: req.headers.host
    });
    await track_edit_model_1.trackEditMain.updateOne({ parent }, { $set: {
            users,
            deletedBy: trackEdit.deletedBy,
            expireDocAfter: trackEdit.deletedBy ? stock_universal_local_1.stockUniversalConfig.expireDocAfterSeconds : ''
        } });
    if (trackEdit.deletedBy) {
        await (0, exports.makeTrackDeleted)({ parent, deletedAt: new Date().toString(), collectionName: trackEdit.collectionName });
    }
    return { success: true, updateParent, savedEdit: found };
};
exports.updateTrackEdit = updateTrackEdit;
/**
 * Deletes a track edit document from the database.
 *
 * @param parent - The id of the parent document.
 * @returns A boolean indicating whether the document was successfully deleted.
 */
const deleteTrackEdit = async (parent) => {
    trackerLogger.info('deleteTrackEdit, parent', parent);
    const isValid = (0, verify_1.verifyObjectId)(parent);
    if (!isValid) {
        return false;
    }
    await track_edit_model_1.trackEditMain.deleteOne({ parent });
    return true;
};
exports.deleteTrackEdit = deleteTrackEdit;
/**
   * Get a track edit by parent id
   * @param req express request
   * @param res express response
   * @returns the track edit document or a 404 if not found
   */
const getTrackEdit = async (req, res) => {
    const isValid = (0, verify_1.verifyObjectId)(res.locals?.trackDataEdit?.parent);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const trackEdit = await track_edit_model_1.trackEditLean
        .findOne({ parent: res.locals?.trackDataEdit?.parent })
        .lean();
    if (!trackEdit) {
        return res.status(404).send({ success: false });
    }
    return res.status(200).send(trackEdit);
};
exports.getTrackEdit = getTrackEdit;
/**
   * Get all track edits
   * @param req express request
   * @param res express response
   * @returns an array of all track edit documents
   */
const getAllTrackEdit = async (req, res) => {
    const trackEdit = await track_edit_model_1.trackEditLean
        .find()
        .lean();
    return res.status(200).send(trackEdit);
};
exports.getAllTrackEdit = getAllTrackEdit;
/**
   * Creates a new track view document in the database.
   *
   * @param req - The Express request object.
   * @param parent - The id of the entity being viewed.
   * @param trackView - The track view data. Must contain a `collectionName` field which is the name of the collection the entity belongs to.
   * @param userId - The id of the user performing the view.
   * @returns A Promise resolving to an `ItrackViewReturn` object with the saved track view document wrapped in `trackView` if successful.
   */
const makeTrackView = async (req, parent, trackView, userId) => {
    trackerLogger.info('makeTrackView, parent', parent);
    trackerLogger.info('makeTrackView, userId', userId);
    const isValid = (0, verify_1.verifyObjectId)(parent);
    if (!isValid) {
        return { success: false };
    }
    const created = await (0, exports.createTrackView)({
        parent,
        users: [{
                _id: userId,
                createdAt: new Date().toString(),
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                deviceInfo: req.headers.host
            }],
        collectionName: trackView.collectionName
    });
    trackerLogger.debug('makeTrackView, created', created);
    return { success: true, trackView: created };
};
exports.makeTrackView = makeTrackView;
/**
   * Updates a track view document in the database.
   *
   * @param req - The Express request object.
   * @param parent - The id of the entity being viewed.
   * @param userId - The id of the user performing the view.
   * @param collectionName - The collection name of the entity being viewed.
   * @returns A Promise resolving to an `ItrackViewReturn` object with the saved track view document wrapped in `trackView` if successful.
   */
const updateTrackView = async (req, parent, userId, collectionName) => {
    trackerLogger.info('updateTrackView, parent', parent);
    trackerLogger.info('updateTrackView, userId', userId);
    trackerLogger.info('updateTrackView, collectionName', collectionName);
    const isValid = (0, verify_1.verifyObjectId)(parent);
    if (!isValid) {
        return { success: false };
    }
    let found = await track_view_model_1.trackViewLean.findOne({ parent }).lean();
    let updateParent = false;
    if (!found) {
        found = await (0, exports.createTrackView)({
            parent,
            users: [],
            collectionName
        });
        updateParent = true;
    }
    const users = found.users;
    users.push({
        _id: userId,
        createdAt: new Date().toString(),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        deviceInfo: req.headers.host
    });
    await track_view_model_1.trackViewMain.updateOne({ parent }, { $set: { users } });
    trackerLogger.debug('updateTrackView, updateParent', updateParent);
    return { success: true, updateParent, trackView: found };
};
exports.updateTrackView = updateTrackView;
/**
   * Delete a track view document by parent id.
   * @param {string} parent - parent id of the document to delete
   * @returns {Promise<boolean>} - true if deletion was successfull, false otherwise
   */
const deleteTrackView = async (parent) => {
    trackerLogger.info('deleteTrackView, parent', parent);
    const isValid = (0, verify_1.verifyObjectId)(parent);
    if (!isValid) {
        return false;
    }
    await track_view_model_1.trackViewMain.deleteOne({ parent });
    return true;
};
exports.deleteTrackView = deleteTrackView;
/**
   * Get a track view document by parent id.
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @returns {Promise<void>} - sends a response with the track view document if found, otherwise a 404
   */
const getTrackView = async (req, res) => {
    const isValid = (0, verify_1.verifyObjectId)(res.locals?.trackDataView?.parent);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const trackView = await track_view_model_1.trackViewLean
        .findOne({ parent: res.locals?.trackDataView?.parent })
        .lean();
    if (!trackView) {
        return res.status(404).send({ success: false });
    }
    return res.status(200).send(trackView);
};
exports.getTrackView = getTrackView;
/**
   * Get all track view documents
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @returns {Promise<void>} - sends a response with all track view documents
   */
const getAllTrackView = async (req, res) => {
    const trackView = await track_view_model_1.trackViewLean
        .find()
        .lean();
    return res.status(200).send(trackView);
};
exports.getAllTrackView = getAllTrackView;
/**
   * Create a track deleted document.
   * @param {ItrackDeleted} trackDeleted - track deleted data
   * @returns {Promise<DocumentType<ItrackDeleted>>} - the saved track deleted document
   */
const makeTrackDeleted = async (trackDeleted) => {
    trackerLogger.info('makeTrackDeleted, trackDeleted', trackDeleted);
    trackDeleted.expireDocAfter = new Date();
    const newTrackDeleted = new track_deleted_model_1.trackDeletedMain(trackDeleted);
    const saved = await newTrackDeleted.save();
    return saved;
};
exports.makeTrackDeleted = makeTrackDeleted;
/**
   * Delete a track deleted document by parent id.
   * @param {string} parent - parent id of the track deleted document
   * @returns {Promise<boolean>} - true if deleted, false if not
   */
const deleteTrackDeleted = async (parent) => {
    trackerLogger.info('deleteTrackDeleted parent', parent);
    const isValid = (0, verify_1.verifyObjectId)(parent);
    if (!isValid) {
        return false;
    }
    await track_deleted_model_1.trackDeletedMain.deleteOne({ parent });
    return true;
};
exports.deleteTrackDeleted = deleteTrackDeleted;
const getAllTrackDeleted = async (req, res) => {
    const trackDeleted = await track_deleted_model_1.trackDeletedLean
        .find()
        .lean();
    return res.status(200).send(trackDeleted);
};
exports.getAllTrackDeleted = getAllTrackDeleted;
/*
export interface IappendTrackEditDataToLocals {
  parent: string;
  createdBy?: string;
  trackDataRestore?: boolean;
  deletedBy?: string;
  status?: number;
  response;
}

export const appendTrackEditToLocals = (data: IappendTrackEditDataToLocals, res, next = true) => {
  res.locals.trackDataEdit = data;
  res.locals.trackDataEdit = next;
};

export interface IappendTrackViewDataToLocals {
  parent: string;
  createdBy?: string;
  status?: number;
  response;
}

export const appendTrackViewToLocals = (data: IappendTrackViewDataToLocals, res, next = true) => {
  res.locals.trackDataView = data;
  res.locals.trackDataView = next;
};
*/
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
const trackUser = (req, res, next) => {
    res.on('finish', async () => {
        trackerLogger.info('trackUser, on finish');
        const user = req.user;
        trackerLogger.debug('trackUser, trackUsers', stock_universal_local_1.stockUniversalConfig.trackUsers);
        if (!stock_universal_local_1.stockUniversalConfig.trackUsers) {
            // next();
            return;
        }
        trackerLogger.debug('trackUser, user', user);
        if (!user || !user.userId) {
            // next();
            return;
        }
        if (!res.locals?.parentsWithCollections) {
            trackerLogger.debug('trackUser, no parents');
            return;
        }
        trackerLogger.debug('trackUser, parents pure', res.locals?.parentsWithCollections);
        const parents = res.locals?.parentsWithCollections?.map(val => {
            if (!val.parent) {
                return null;
            }
            val.parent = val.parent.toString();
            return val;
        }).filter((obj, index, self) => // remove duplicates
         index === self.findIndex((t) => t.parent === obj.parent));
        trackerLogger.debug('trackUser, parents transformed', parents);
        if (!parents) {
            return;
        }
        const promises = parents.map(async (parentWithCollection) => {
            trackerLogger.error('trackDataView', 999999, parentWithCollection.trackWhat);
            switch (parentWithCollection.trackWhat) {
                case 'makeTrackEdit': {
                    const trackEdit = {
                        parent: parentWithCollection.parent,
                        createdBy: user.userId,
                        users: [],
                        collectionName: parentWithCollection.collection
                    };
                    const { updateParent, savedEdit } = await (0, exports.updateTrackEdit)(req, parentWithCollection.parent, trackEdit, user.userId, false);
                    if (updateParent) {
                        await database_1.mainConnection.db.collection(parentWithCollection.collection).updateOne({ _id: new mongoose_1.Types.ObjectId(parentWithCollection.parent) }, { $set: { trackEdit: savedEdit._id.toString() } });
                    }
                    break;
                }
                case 'trackDataView': {
                    const { updateParent, trackView } = await (0, exports.updateTrackView)(req, parentWithCollection.parent, user.userId, parentWithCollection.collection);
                    if (updateParent) {
                        trackerLogger.error('collection', 7777777, parentWithCollection.collection);
                        await database_1.mainConnection.db.collection(parentWithCollection.collection).updateOne({ _id: new mongoose_1.Types.ObjectId(parentWithCollection.parent) }, { $set: { trackView: trackView._id.toString() } }).catch(err => {
                            trackerLogger.error('update error ', err);
                        });
                    }
                    break;
                }
                case 'trackDataRestore': {
                    const trackEdit = {
                        parent: parentWithCollection.parent,
                        createdBy: user.userId,
                        users: [],
                        collectionName: parentWithCollection.collection
                    };
                    const { updateParent, savedEdit } = await (0, exports.updateTrackEdit)(req, parentWithCollection.parent, trackEdit, user.userId, true);
                    if (updateParent) {
                        await database_1.mainConnection.db.collection(parentWithCollection.collection).updateOne({ _id: new mongoose_1.Types.ObjectId(parentWithCollection.parent) }, { $set: { trackEdit: savedEdit._id.toString() } });
                    }
                    break;
                }
                case 'trackDataDelete': {
                    const trackEdit = {
                        parent: parentWithCollection.parent,
                        deletedBy: user.userId,
                        users: [],
                        collectionName: parentWithCollection.collection
                    };
                    await (0, exports.updateTrackEdit)(req, parentWithCollection.parent, trackEdit, user.userId);
                    break;
                }
            }
            return new Promise((resolve, reject) => {
                return resolve(true);
            });
        });
        await Promise.all(promises);
        trackerLogger.debug('trackUser, resolved');
    });
    next();
};
exports.trackUser = trackUser;
/**
 * Adds a parent to the locals object, so that it can be used in the trackMiddleWare to add a trackEntry.
 *
 * @param {Response} res - the express response object
 * @param {string} parent - the parent Id
 * @param {string} collection - the collection name
 * @param {TtrackWhat} trackWhat - what to track, e.g. trackEdit, trackView, trackDeleted
 */
const addParentToLocals = (res, parent, collection, trackWhat) => {
    if (!res.locals.parentsWithCollections) {
        res.locals.parentsWithCollections = [];
    }
    res.locals.parentsWithCollections.push({ parent, collection, trackWhat });
};
exports.addParentToLocals = addParentToLocals;
const clearFsFiles = () => {
};
exports.clearFsFiles = clearFsFiles;
// TODO
const hasValidIdsInRequest = (req, res, next) => {
    const idStrings = [];
    // eslint-disable-next-line no-var
    var { ids, id } = req.params || {};
    if (id) {
        idStrings.push(id);
    }
    if (ids && ids.length) {
        for (const id of ids) {
            idStrings.push(id);
        }
    }
    // eslint-disable-next-line no-var, @typescript-eslint/naming-convention
    var { ids, id, _id } = req.body || {};
    if (id) {
        idStrings.push(id);
    }
    if (ids && ids.length) {
        for (const id of ids) {
            idStrings.push(id);
        }
    }
    if (_id) {
        idStrings.push(_id);
    }
    for (const objVal in req.body) {
        const isId = req.body[objVal]?._id || req.body[objVal]?.id;
        if (isId) {
            idStrings.push(isId);
        }
        const ids = req.body[objVal]?._ids;
        if (ids && ids.length) {
            for (const id of ids) {
                idStrings.push(id);
            }
        }
    }
    if (idStrings.length > 0) {
        const isValid = (0, verify_1.verifyObjectIds)(idStrings);
        if (!isValid) {
            trackerLogger.error('hasValidIdsInRequest idStrings', idStrings);
            return res.status(401).send({ success: false, err: 'unauthorised' });
        }
    }
    return next();
};
exports.hasValidIdsInRequest = hasValidIdsInRequest;
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
const isDocDeleted = async (req, res, next) => {
    const parents = [];
    if (req.params.id) {
        parents.push(req.params.id);
    }
    if (req.body.id) {
        parents.push(req.body.id);
    }
    if (parents.length < 0 && req.body) {
        for (const objVal in req.body) {
            const isId = req.body[objVal]?._id || req.body[objVal]?.id;
            if (isId) {
                parents.push(isId);
            }
        }
    }
    if (parents.length > 0) {
        const found = await track_deleted_model_1.trackDeletedLean.find({ parent: { $in: parents } }).lean();
        if (found.length > 0) {
            trackerLogger.error('isDocDeleted length', found.length);
            return res.status(401).send({ success: false, err: 'unauthorised' });
        }
    }
    return next();
};
exports.isDocDeleted = isDocDeleted;
// TODO delete immediately
exports.trackRoutes = express_1.default.Router();
/* trackRoutes.put('/restoreFile/:id', requireAuth, async(req, res) => {
  const { id } = req.parama;
  const trackDeleted = await trackDeletedLean.findOne({ _id: id }).lean();

  let updateErr;

  const restored = await mainConnection.db.collection(trackDeleted.collectionName)
    .updateOne({}, {})
    .catch(err => {
      updateErr = err;

      return err;
    });

  if (updateErr) {
    return res.status(401).send({ success: false, err: 'unauthorised' });
  }

  addParentToLocals(res, trackDeleted._id, trackDeleted.collectionName, 'trackDataRestore');

  return res.status(200).send({ success: true });
});

trackRoutes.put('/restoreFile/:id', requireAuth, async(req, res) => {
  const { id } = req.parama;
  const trackDeleted = await trackDeletedLean.findOne({ _id: id }).lean();

  let updateErr;

  const restored = await mainConnection.db.collection(trackDeleted.collectionName)
    .updateOne({}, {})
    .catch(err => {
      updateErr = err;

      return err;
    });

  if (updateErr) {
    return res.status(401).send({ success: false, err: 'unauthorised' });
  }

  addParentToLocals(res, trackDeleted._id, trackDeleted.collectionName, 'trackDataRestore');

  return res.status(200).send({ success: true });
}); */
exports.trackRoutes.post('/gettrackviewbydate/:offset/:limit', expressrouter_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, offsetlimitrelegator_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    let filter = {};
    switch (req.params.direction) {
        case 'eq':
            filter = { createdAt: { $eq: new Date(req.body.dateVal).toISOString() } };
            break;
        case 'gte':
            filter = { createdAt: { $gte: new Date(req.body.gteDateVal).toISOString() } };
            break;
        case 'lte':
            filter = { createdAt: { $lte: new Date(req.body.dateVal).toISOString() } };
            break;
        case 'between':
            if (!req.body.gteDateVal || new Date(req.params.lower) > new Date(req.body.gteDateVal)) {
                return res.status(401).send({ success: false, err: 'unauthorised' });
            }
            filter = { createdAt: { $gte: req.body.dateVal, $lte: req.body.gteDateVal } };
            break;
        default:
            filter = { createdAt: { $eq: new Date(req.body.dateVal).toISOString() } };
            break;
    }
    const all = await Promise.all([
        track_view_model_1.trackViewLean
            .find({
            isDeleted: false,
            ...filter
        })
            .skip(offset)
            .limit(limit)
            .lean(),
        track_view_model_1.trackViewLean.countDocuments({ isDeleted: false, ...filter })
    ]);
    const response = {
        count: all[1],
        data: await transformDataWitParents(all[0])
    };
    return res.status(200).send(response);
});
exports.trackRoutes.post('/gettrackviewbyuserdate/:offset/:limit', expressrouter_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, offsetlimitrelegator_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    let filter = {};
    switch (req.params.direction) {
        case 'eq':
            filter = { users: { $elemMatch: { createdAt: { $eq: new Date(req.body.dateVal).toISOString() } } } };
            break;
        case 'gte':
            filter = { users: { $elemMatch: { createdAt: { $gte: new Date(req.body.gteDateVal).toISOString() } } } };
            break;
        case 'lte':
            filter = { users: { $elemMatch: { createdAt: { $lte: new Date(req.body.dateVal).toISOString() } } } };
            break;
        case 'between':
            if (!req.body.gteDateVal || new Date(req.params.lower) > new Date(req.body.gteDateVal)) {
                return res.status(401).send({ success: false, err: 'unauthorised' });
            }
            filter = { users: { $elemMatch: { createdAt: { $gte: req.body.dateVal, $lte: req.body.gteDateVal } } } };
            break;
        default:
            filter = { users: { $elemMatch: { createdAt: { $eq: new Date(req.body.dateVal).toISOString() } } } };
            break;
    }
    const all = await Promise.all([
        track_view_model_1.trackViewLean
            .find({
            isDeleted: false,
            ...filter
        })
            .skip(offset)
            .limit(limit)
            .lean(),
        track_view_model_1.trackViewLean.countDocuments({ isDeleted: false, ...filter })
    ]);
    const response = {
        count: all[1],
        data: await transformDataWitParents(all[0])
    };
});
exports.trackRoutes.get('/gettrackviewbyparent/:parent', expressrouter_1.requireAuth, async (req, res) => {
    const { parent } = req.params;
    const isValid = (0, verify_1.verifyObjectId)(parent);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const found = await track_view_model_1.trackViewLean.findOne({
        parent
    }).lean();
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    found.users = await transformWithUserData(found.users);
    return res.status(200).send(found);
});
exports.trackRoutes.get('/gettrackeditbyparent/:parent', expressrouter_1.requireAuth, async (req, res) => {
    const { parent } = req.params;
    const isValid = (0, verify_1.verifyObjectId)(parent);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const found = await track_edit_model_1.trackEditLean.findOne({
        parent
    }).lean();
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    found.users = await transformWithUserData(found.users);
    return res.status(200).send(found);
});
exports.trackRoutes.get('/gettrackdeletebyparent/:parent', expressrouter_1.requireAuth, async (req, res) => {
    const { parent } = req.params;
    const isValid = (0, verify_1.verifyObjectId)(parent);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const found = await track_deleted_model_1.trackDeletedLean.findOne({
        parent
    }).lean();
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    return res.status(200).send(found);
});
exports.trackRoutes.get('/gettrackviewbyuser/:offset/:limit/:userId', expressrouter_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, offsetlimitrelegator_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const isValid = (0, verify_1.verifyObjectId)(req.params.userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        track_view_model_1.trackViewLean
            .find({
            isDeleted: false,
            users: { $elemMatch: { _id: req.params.userId } }
        })
            .skip(offset)
            .limit(limit)
            .lean(),
        track_view_model_1.trackViewLean.countDocuments({ isDeleted: false, users: { $elemMatch: { _id: req.params.userId } } })
    ]);
    const response = {
        count: all[1],
        data: await transformDataWitParents(all[0])
    };
    return res.status(200).send(response);
});
exports.trackRoutes.get('/gettrackeditbyuser/:offset/:limit/:userId', expressrouter_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, offsetlimitrelegator_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const isValid = (0, verify_1.verifyObjectId)(req.params.userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        track_edit_model_1.trackEditLean
            .find({
            isDeleted: false,
            users: { $elemMatch: { _id: req.params.userId } }
        })
            .skip(offset)
            .limit(limit)
            .lean(),
        track_edit_model_1.trackEditLean.countDocuments({ isDeleted: false, users: { $elemMatch: { _id: req.params.userId } } })
    ]);
    const response = {
        count: all[1],
        data: await transformDataWitParents(all[0])
    };
    return res.status(200).send(response);
});
exports.trackRoutes.get('/gettrackview/:offset/:limit', expressrouter_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, offsetlimitrelegator_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const isValid = (0, verify_1.verifyObjectId)(req.params.userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        track_view_model_1.trackViewLean
            .find({
            users: { $elemMatch: { _id: req.params.userId } }
        })
            .skip(offset)
            .limit(limit)
            .lean(),
        track_view_model_1.trackViewLean.countDocuments({ users: { $elemMatch: { _id: req.params.userId } } })
    ]);
    const response = {
        count: all[1],
        data: await transformDataWitParents(all[0])
    };
    return res.status(200).send(response);
});
exports.trackRoutes.get('/gettrackedit/:offset/:limit', expressrouter_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, offsetlimitrelegator_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const isValid = (0, verify_1.verifyObjectId)(req.params.userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        track_edit_model_1.trackEditLean
            .find({
            users: { $elemMatch: { _id: req.params.userId } }
        })
            .skip(offset)
            .limit(limit)
            .lean(),
        track_edit_model_1.trackEditLean.countDocuments({ users: { $elemMatch: { _id: req.params.userId } } })
    ]);
    const response = {
        count: all[1],
        data: await transformDataWitParents(all[0])
    };
    return res.status(200).send(response);
});
exports.trackRoutes.get('/gettrackdelete/:offset/:limit', expressrouter_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, offsetlimitrelegator_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const isValid = (0, verify_1.verifyObjectId)(req.params.userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        track_deleted_model_1.trackDeletedLean
            .find({
            users: { $elemMatch: { _id: req.params.userId } }
        })
            .skip(offset)
            .limit(limit)
            .lean(),
        track_deleted_model_1.trackDeletedLean.countDocuments({ users: { $elemMatch: { _id: req.params.userId } } })
    ]);
    const response = {
        count: all[1],
        data: await transformDataWitParents(all[0])
    };
    return res.status(200).send(response);
});
exports.trackRoutes.delete('/deletetrackdelete/:id', expressrouter_1.requireAuth, (req, res) => {
    const { id } = req.params;
    // remove parent
});
exports.trackRoutes.delete('/deletetrackedit/:id', expressrouter_1.requireAuth, (req, res) => {
    const { id } = req.params;
    // remove parent
});
exports.trackRoutes.delete('/deletetrackview/:id', expressrouter_1.requireAuth, (req, res) => {
    const { id } = req.params;
    // remove parent
});
/**
   * Transforms the given data by replacing the parent id with the actual parent
   * document. The parent document is fetched from the database based on the
   * collection name provided in the data.
   * @param data Data with parent id
   * @returns Data with parent document
   */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformDataWitParents = async (data) => {
    const allWithParnet = data.map(async (val) => {
        val.parent = await getParentData(val.parent, val.collectionName);
        return new Promise((resolve) => {
            return resolve(val);
        });
    });
    const dataWithParent = await Promise.all(allWithParnet);
    return dataWithParent;
};
/**
 * getParentData
 *
 * @description
 * Given the parent id and collectionName, it will return the information of the parent in the given collection.
 * The returned data will have the following structure:
 * {
 *   info: string,
 *   urId: string,
 *   dataType: string,
 *   invoiceId?: string,
 *   estimateId?: string
 * }
 *
 * @param {string} parent - The id of the parent
 * @param {string} collectionName - The name of the collection in which the parent is present
 *
 * @returns {Promise<IparentData>} - The parent data
 *
 * @example
 * getParentData('5f6a2f9b46c2cb0017c3a2b6', 'users').then(data => {
 *   console.log(data);
 * });
 */
const getParentData = async (parent, collectionName) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filter = [{
            $project: {
                info: { $concat: ['$user.fname', '', '$user.lname'] }
            }
        }];
    switch (collectionName) {
        case 'users':
            filter = [
                ...(0, general_1.lookupPhotos)(),
                {
                    $project: {
                        info: { $concat: ['$fname', ' ', '$lname'] },
                        urId: '$urId',
                        dataType: 'user'
                    }
                }
            ];
            break;
        case 'companies':
            filter = [
                ...(0, general_1.lookupUser)(),
                {
                    $project: {
                        info: '$displayName',
                        urId: '$urId',
                        dataType: 'company'
                    }
                }
            ];
            break;
        case 'companysubscriptions':
            filter = [
                {
                    $project: {
                        info: '$displayName',
                        urId: '$urId',
                        dataType: 'company-subscription'
                    }
                }
            ];
            break;
        case 'customers':
            filter = [
                ...(0, general_1.lookupUser)(),
                {
                    $project: {
                        info: { $concat: ['$user.fname', '', '$user.lname'] },
                        urId: '$urId',
                        dataType: 'customer'
                    }
                }
            ];
            break;
        case 'deliverycities':
            filter = [
                {
                    $project: {
                        info: '$name',
                        urId: '$urId',
                        dataType: 'delivery-city'
                    }
                }
            ];
            break;
        case 'deliverynotes':
            filter = [
                ...(0, general_1.lookupInvoiceRelated)(),
                {
                    $project: {
                        info: '$urId',
                        urId: '$urId',
                        invoiceId: '$invoiceRelated.invoiceId',
                        estimateId: '$invoiceRelated.estimateId',
                        dataType: 'delivery-note'
                    }
                }
            ];
            break;
        case 'estimates':
            filter = [
                ...(0, general_1.lookupInvoiceRelated)(),
                {
                    $project: {
                        info: '$invoiceRelated.estimateId',
                        urId: '$urId',
                        invoiceId: '$invoiceRelated.invoiceId',
                        estimateId: '$invoiceRelated.estimateId',
                        dataType: 'estimate'
                    }
                }
            ];
            break;
        case 'expensereports':
            filter = [
                {
                    $project: {
                        info: '$urId',
                        urId: '$urId',
                        dataType: 'expense-report'
                    }
                }
            ];
            break;
        case 'expenses':
            filter = [
                {
                    $project: {
                        info: '$name',
                        urId: '$urId',
                        dataType: 'expense'
                    }
                }
            ];
            break;
        case 'faqanswers':
            filter = [
                {
                    $project: {
                        info: '$urId',
                        urId: '$urId',
                        dataType: 'faq-answer'
                    }
                }
            ];
            break;
        case 'faqs':
            filter = [
                {
                    $project: {
                        info: '$urId',
                        urId: '$urId',
                        dataType: 'faq'
                    }
                }
            ];
            break;
        case 'filemetas':
            filter = [
                {
                    $project: {
                        info: '$name',
                        urId: '$urId',
                        dataType: 'file'
                    }
                }
            ];
            break;
        case 'invoicerelateds':
            filter = [
                {
                    $project: {
                        info: '$billingUser', // TODO get better display field
                        urId: '$urId',
                        invoiceId: '$invoiceId',
                        estimateId: '$estimateId',
                        dataType: 'invoice-related'
                    }
                }
            ];
            break;
        case 'invoices':
            filter = [
                ...(0, general_1.lookupInvoiceRelated)(),
                {
                    $project: {
                        info: '$invoiceRelated.invoiceId',
                        urId: '$urId',
                        invoiceId: '$invoiceRelated.invoiceId',
                        estimateId: '$invoiceRelated.estimateId',
                        dataType: 'invoice'
                    }
                }
            ];
            break;
        case 'invoicesettings':
            filter = [
                ...(0, general_1.lookupBillingUser)(),
                {
                    $project: {
                        info: 'added invoice settings',
                        urId: '$urId',
                        dataType: 'invoice-setting'
                    }
                }
            ];
            break;
        case 'invoicesreports':
            filter = [
                {
                    $project: {
                        info: '$urId',
                        urId: '$urId',
                        dataType: 'invoices-report'
                    }
                }
            ];
            break;
        case 'itemdecoys':
            filter = [
                ...(0, general_1.lookupItems)(),
                {
                    $project: {
                        info: '$items[0].name', // TODO get better display field
                        urId: '$urId',
                        dataType: 'item-decoy'
                    }
                }
            ];
            break;
        case 'itemoffers':
            filter = [
                ...(0, general_1.lookupItems)(),
                {
                    $project: {
                        info: '$items[0].name', // TODO get better display field
                        urId: '$urId',
                        dataType: 'item-offer'
                    }
                }
            ];
            break;
        case 'items':
            filter = [
                ...(0, general_1.lookupPhotos)(),
                {
                    $project: {
                        info: '$name',
                        urId: '$urId',
                        dataType: 'item'
                    }
                }
            ];
            break;
        case 'orders':
            filter = [
                ...(0, general_1.lookupPaymentRelated)(),
                ...(0, general_1.lookupInvoiceRelated)(),
                {
                    $project: {
                        info: 'made Order',
                        urId: '$urId',
                        dataType: 'order'
                    }
                }
            ];
            break;
            break;
        case 'payments':
            filter = [
                ...(0, general_1.lookupPaymentRelated)(),
                ...(0, general_1.lookupInvoiceRelated)(),
                {
                    $project: {
                        info: 'made payment',
                        urId: '$urId',
                        dataType: ''
                    }
                }
            ];
            break;
        case 'pickuplocations':
            filter = [
                {
                    $project: {
                        info: '$urId',
                        urId: '$urId',
                        dataType: 'pickup-location'
                    }
                }
            ];
            break;
        case 'profitandlossreports':
            filter = [
                {
                    $project: {
                        info: '$urId',
                        urId: '$urId',
                        dataType: 'profitandloss-report'
                    }
                }
            ];
            break;
        case 'receipts':
            filter = [
                ...(0, general_1.lookupInvoiceRelated)(),
                {
                    $project: {
                        info: '$urId',
                        urId: '$urId',
                        invoiceId: '$invoiceRelated.invoiceId',
                        estimateId: '$invoiceRelated.estimateId',
                        dataType: 'receipt'
                    }
                }
            ];
            break;
        case 'reviews':
            filter = [
                {
                    $project: {
                        info: '$urId',
                        urId: '$urId',
                        dataType: 'review'
                    }
                }
            ];
            break;
        case 'salesreports':
            filter = [
                {
                    $project: {
                        info: '$urId',
                        urId: '$urId',
                        dataType: 'sales-report'
                    }
                }
            ];
            break;
        case 'staffs':
            filter = [
                ...(0, general_1.lookupUser)(),
                {
                    $project: {
                        info: { $concat: ['$user.fname', '', '$user.lname'] },
                        urId: '$urId',
                        dataType: 'staff'
                    }
                }
            ];
            break;
    }
    const parentDataCursor = database_1.mainConnection.db.collection(collectionName)
        .aggregate([{
            $match: { _id: { $eq: new mongoose_1.Types.ObjectId(parent) } }
        }, ...filter]);
    const parentDataArr = [];
    for await (const data of parentDataCursor) {
        parentDataArr.push(data);
    }
    return parentDataArr[0];
};
/**
   * Transforms an array of IuserActionTrack objects with the user data for each _id.
   * @param {IuserActionTrack[]} data - The array of IuserActionTrack objects.
   * @returns {Promise<IuserActionTrack[]>} - A promise that resolves to an array of IuserActionTrack objects with the user data.
   */
const transformWithUserData = async (data) => {
    const allWithParnet = data.map(async (val) => {
        val._id = await getUserData(val._id);
        return new Promise((resolve) => {
            return resolve(val);
        });
    });
    const dataWithParent = await Promise.all(allWithParnet);
    return dataWithParent;
};
/**
   * Retrieves a user document from the database based on the provided user ID.
   * @param {string} userId - The ID of the user to retrieve.
   * @returns {Promise<Iuser | null>} - A promise that resolves to the user document or null if the user ID is invalid.
   */
const getUserData = async (userId) => {
    const isValid = (0, verify_1.verifyObjectId)(userId);
    if (!isValid) {
        return null;
    }
    // bear with me here because users can be universially easer to knnow the created collection name
    const user = await database_1.mainConnection.db.collection('users').findOne({ _id: new mongoose_1.Types.ObjectId(userId) });
    return user;
};
/**
   * Periodically removes all documents from all collections that have been marked as deleted
   * and have an expireDocAfter date that is older than the configured expireDocAfterSeconds.
   * @returns {Promise<void>} - A promise that resolves when all documents have been removed.
   */
const periodicRemove = async () => {
    const dateDiff = addSecondsToDate(new Date(), -stock_universal_local_1.stockUniversalConfig.expireDocAfterSeconds);
    const collectionNames = await database_1.mainConnection.db.listCollections().toArray();
    for (const { name } of collectionNames) {
        database_1.mainConnection.db.collection(name).deleteMany({
            isDeleted: true,
            expireDocAfter: {
                $lt: dateDiff
            }
        });
    }
};
exports.periodicRemove = periodicRemove;
const deleteLingeringFiles = async () => {
    // TODO thisis tricky since is not linked
};
exports.deleteLingeringFiles = deleteLingeringFiles;
/**
   * Periodically cleans up files that are marked as deleted and have expired.
   * Automatically called by the periodic task manager.
   * @returns {Promise<void>}
   */
const autoCleanFiles = async () => {
    const dateDiff = addSecondsToDate(new Date(), -stock_universal_local_1.stockUniversalConfig.expireDocAfterSeconds);
    const filter = { isDeleted: true, expireDocAfter: { $lt: dateDiff } };
    const files = await filemeta_model_1.fileMetaLean.find(filter).lean();
    await (0, fs_1.deleteAllFiles)(files, true);
};
exports.autoCleanFiles = autoCleanFiles;
/**
   * Adds n seconds to the given date.
   * @param {Date} date The date to add the seconds to
   * @param {number} n The number of seconds to add
   * @returns {Date} The new date with the seconds added
   */
const addSecondsToDate = (date, n) => {
    const d = new Date(date);
    d.setTime(d.getTime() + n * 1000);
    return d;
};
//# sourceMappingURL=track.js.map