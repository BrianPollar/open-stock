import { Icustomrequest, IdataArrayResponse, Isuccess, ItrackDeleted, ItrackEdit, ItrackView, Iuser, IuserActionTrack, TtrackWhat, TuserActionTrackState } from '@open-stock/stock-universal';
import express from 'express';
import * as fs from 'fs';
import { Types } from 'mongoose';
import path from 'path';
import * as tracer from 'tracer';
import { deleteAllFiles } from '../filemanager/fs';
import { fileMetaLean } from '../models/filemeta.model';
import { trackDeletedLean, trackDeletedMain } from '../models/tracker/track-deleted.model';
import { trackEditLean, trackEditMain } from '../models/tracker/track-edit.model';
import { trackViewLean, trackViewMain } from '../models/tracker/track-view.model';
import { lookupBillingUser, lookupInvoiceRelated, lookupItems, lookupPaymentRelated, lookupPhotos, lookupUser } from '../query/general';
import { stockUniversalConfig } from '../stock-universal-local';
import { mainConnection } from './database';
import { requireAuth } from './expressrouter';
import { offsetLimitRelegator } from './offsetlimitrelegator';
import { verifyObjectId, verifyObjectIds } from './verify';

const trackerLogger = tracer.colorConsole({
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


/**
 * Creates a new track edit in the database.
 *
 * @param trackEdit - The track edit to create. Must contain a `parent` field which is the id of the entity being edited.
 * @returns The saved track edit document.
 */
export const createTrackEdit = async(trackEdit: ItrackEdit) => {
  trackerLogger.info('createTrackEdit, trackEdit', trackEdit);
  const newTrackEdit = new trackEditMain(trackEdit);

  const saved = await newTrackEdit.save();

  return saved;
};

/**
 * Creates a new track view in the database.
 *
 * @param trackView - The track view to create. Must contain a `parent` field which is the id of the entity being viewed.
 * @returns The saved track view document.
 */
export const createTrackView = async(trackView: ItrackView) => {
  trackerLogger.info('createTrackView, ', trackView);
  const newTrackView = new trackViewMain(trackView);

  const saved = await newTrackView.save();

  return saved;
};

/**
 * Creates a new track deleted in the database.
 *
 * @param trackDeleted - The track deleted to create. Must contain a `parent` field which is the id of the entity being deleted.
 * @returns The saved track deleted document.
 */
export const createTrackDeleted = async(trackDeleted: ItrackDeleted) => {
  trackerLogger.info('createTrackDeleted, ', trackDeleted);
  const newTrackDeleted = new trackDeletedMain(trackDeleted);

  const saved = await newTrackDeleted.save();

  return saved;
};


export interface ItrackReturn
extends Isuccess {
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
export const makeTrackEdit = async(req, parent: string, trackEdit: ItrackEdit): Promise<ItrackReturn> => {
  trackerLogger.info('parent ', parent);
  const isValid = verifyObjectId(parent);

  if (!isValid) {
    return { success: false };
  }

  const created = await createTrackEdit({
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
export const updateTrackEdit = async(req, parent: string, trackEdit: ItrackEdit, userId: string, trackDataRestore = false): Promise<ItrackEditReturn> => {
  trackerLogger.info('updateTrackEdit, parent ', parent);
  trackerLogger.info('updateTrackEdit, userId ', userId);
  trackerLogger.info('updateTrackEdit, trackDataRestore ', trackDataRestore);

  const isValid = verifyObjectId(parent);

  if (!isValid) {
    return { success: false };
  }
  let found = await trackEditLean.findOne({ parent }).lean();


  const users = found?.users || [];
  let state: TuserActionTrackState = trackEdit?.deletedBy ? 'delete' : 'update';

  if (trackDataRestore) {
    state = 'restore';
  }

  if (trackEdit.deletedBy) {
    state = 'delete';
  }

  let updateParent = false;

  if (!found) {
    found = await createTrackEdit({
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

  await trackEditMain.updateOne({ parent }, { $set: {
    users,
    deletedBy: trackEdit.deletedBy,
    expireDocAfter: trackEdit.deletedBy ? stockUniversalConfig.expireDocAfterSeconds : '' } });

  if (trackEdit.deletedBy) {
    await makeTrackDeleted({ parent, deletedAt: new Date().toString(), collectionName: trackEdit.collectionName });
  }

  return { success: true, updateParent, savedEdit: found };
};

/**
 * Deletes a track edit document from the database.
 *
 * @param parent - The id of the parent document.
 * @returns A boolean indicating whether the document was successfully deleted.
 */
export const deleteTrackEdit = async(parent: string) => {
  trackerLogger.info('deleteTrackEdit, parent', parent);

  const isValid = verifyObjectId(parent);

  if (!isValid) {
    return false;
  }
  await trackEditMain.deleteOne({ parent });

  return true;
};

/**
   * Get a track edit by parent id
   * @param req express request
   * @param res express response
   * @returns the track edit document or a 404 if not found
   */
export const getTrackEdit = async(req, res)=> {
  const isValid = verifyObjectId(res.locals?.trackDataEdit?.parent);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const trackEdit = await trackEditLean
    .findOne({ parent: res.locals?.trackDataEdit?.parent })
    .lean();

  if (!trackEdit) {
    return res.status(404).send({ success: false });
  }

  return res.status(200).send(trackEdit);
};

/**
   * Get all track edits
   * @param req express request
   * @param res express response
   * @returns an array of all track edit documents
   */
export const getAllTrackEdit = async(req, res)=> {
  const trackEdit = await trackEditLean
    .find()
    .lean();

  return res.status(200).send(trackEdit);
};

export interface ItrackViewReturn
extends Isuccess {
  trackView?: ItrackView;
  updateParent?: boolean;
}

export interface ItrackEditReturn
extends Isuccess {
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
export const makeTrackView = async(req, parent: string, trackView: ItrackView, userId: string): Promise<ItrackViewReturn> => {
  trackerLogger.info('makeTrackView, parent', parent);
  trackerLogger.info('makeTrackView, userId', userId);

  const isValid = verifyObjectId(parent);

  if (!isValid) {
    return { success: false };
  }
  const created = await createTrackView({
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

/**
   * Updates a track view document in the database.
   *
   * @param req - The Express request object.
   * @param parent - The id of the entity being viewed.
   * @param userId - The id of the user performing the view.
   * @param collectionName - The collection name of the entity being viewed.
   * @returns A Promise resolving to an `ItrackViewReturn` object with the saved track view document wrapped in `trackView` if successful.
   */
export const updateTrackView = async(req, parent: string, userId: string, collectionName: string): Promise<ItrackViewReturn> => {
  trackerLogger.info('updateTrackView, parent', parent);
  trackerLogger.info('updateTrackView, userId', userId);
  trackerLogger.info('updateTrackView, collectionName', collectionName);

  const isValid = verifyObjectId(parent);

  if (!isValid) {
    return { success: false };
  }
  let found = await trackViewLean.findOne({ parent }).lean();

  let updateParent = false;

  if (!found) {
    found = await createTrackView({
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

  await trackViewMain.updateOne({ parent }, { $set: { users } });

  trackerLogger.debug('updateTrackView, updateParent', updateParent);

  return { success: true, updateParent, trackView: found };
};

/**
   * Delete a track view document by parent id.
   * @param {string} parent - parent id of the document to delete
   * @returns {Promise<boolean>} - true if deletion was successfull, false otherwise
   */
export const deleteTrackView = async(parent: string) => {
  trackerLogger.info('deleteTrackView, parent', parent);

  const isValid = verifyObjectId(parent);

  if (!isValid) {
    return false;
  }
  await trackViewMain.deleteOne({ parent });

  return true;
};

/**
   * Get a track view document by parent id.
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @returns {Promise<void>} - sends a response with the track view document if found, otherwise a 404
   */
export const getTrackView = async(req, res)=> {
  const isValid = verifyObjectId(res.locals?.trackDataView?.parent);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const trackView = await trackViewLean
    .findOne({ parent: res.locals?.trackDataView?.parent })
    .lean();

  if (!trackView) {
    return res.status(404).send({ success: false });
  }

  return res.status(200).send(trackView);
};

/**
   * Get all track view documents
   * @param {Request} req - express request object
   * @param {Response} res - express response object
   * @returns {Promise<void>} - sends a response with all track view documents
   */
export const getAllTrackView = async(req, res)=> {
  const trackView = await trackViewLean
    .find()
    .lean();

  return res.status(200).send(trackView);
};

/**
   * Create a track deleted document.
   * @param {ItrackDeleted} trackDeleted - track deleted data
   * @returns {Promise<DocumentType<ItrackDeleted>>} - the saved track deleted document
   */
export const makeTrackDeleted = async(trackDeleted: ItrackDeleted) => {
  trackerLogger.info('makeTrackDeleted, trackDeleted', trackDeleted);
  trackDeleted.expireDocAfter = new Date();
  const newTrackDeleted = new trackDeletedMain(trackDeleted);
  const saved = await newTrackDeleted.save();

  return saved;
};

/**
   * Delete a track deleted document by parent id.
   * @param {string} parent - parent id of the track deleted document
   * @returns {Promise<boolean>} - true if deleted, false if not
   */
export const deleteTrackDeleted = async(parent: string) => {
  trackerLogger.info('deleteTrackDeleted parent', parent);
  const isValid = verifyObjectId(parent);

  if (!isValid) {
    return false;
  }

  await trackDeletedMain.deleteOne({ parent });

  return true;
};

export const getAllTrackDeleted = async(req, res)=> {
  const trackDeleted = await trackDeletedLean
    .find()
    .lean();

  return res.status(200).send(trackDeleted);
};

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
export const trackUser = (req, res, next) => {
  res.on('finish', async() => {
    trackerLogger.info('trackUser, on finish');
    const user = (req as Icustomrequest).user;

    trackerLogger.debug('trackUser, trackUsers', stockUniversalConfig.trackUsers);
    if (!stockUniversalConfig.trackUsers) {
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

    const parents = res.locals?.parentsWithCollections?.map(val => { // convert object id to string
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

    const promises = parents.map(async parentWithCollection => {
      trackerLogger.error('trackDataView', 999999, parentWithCollection.trackWhat);
      switch (parentWithCollection.trackWhat) {
        case 'makeTrackEdit':{
          const trackEdit: ItrackEdit = {
            parent: parentWithCollection.parent,
            createdBy: user.userId,
            users: [],
            collectionName: parentWithCollection.collection
          };

          const { updateParent, savedEdit } = await updateTrackEdit(req, parentWithCollection.parent, trackEdit, user.userId, false);

          if (updateParent) {
            await mainConnection.db.collection(parentWithCollection.collection).updateOne({ _id: new Types.ObjectId(parentWithCollection.parent) }, { $set: { trackEdit: savedEdit._id.toString() } });
          }
          break;
        }
        case 'trackDataView': {
          const { updateParent, trackView } = await updateTrackView(req, parentWithCollection.parent, user.userId, parentWithCollection.collection);

          if (updateParent) {
            trackerLogger.error('collection', 7777777, parentWithCollection.collection);

            await mainConnection.db.collection(parentWithCollection.collection).updateOne({ _id: new Types.ObjectId(parentWithCollection.parent) }, { $set: { trackView: trackView._id.toString() } }).catch(err =>{
              trackerLogger.error('update error ', err);
            });
          }


          break;
        }

        case 'trackDataRestore': {
          const trackEdit: ItrackEdit = {
            parent: parentWithCollection.parent,
            createdBy: user.userId,
            users: [],
            collectionName: parentWithCollection.collection
          };

          const { updateParent, savedEdit } = await updateTrackEdit(req, parentWithCollection.parent, trackEdit, user.userId, true);

          if (updateParent) {
            await mainConnection.db.collection(parentWithCollection.collection).updateOne({ _id: new Types.ObjectId(parentWithCollection.parent) }, { $set: { trackEdit: savedEdit._id.toString() } });
          }

          break;
        }

        case 'trackDataDelete': {
          const trackEdit: ItrackEdit = {
            parent: parentWithCollection.parent,
            deletedBy: user.userId,
            users: [],
            collectionName: parentWithCollection.collection
          };

          await updateTrackEdit(req, parentWithCollection.parent, trackEdit, user.userId);
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

/**
 * Adds a parent to the locals object, so that it can be used in the trackMiddleWare to add a trackEntry.
 *
 * @param {Response} res - the express response object
 * @param {string} parent - the parent Id
 * @param {string} collection - the collection name
 * @param {TtrackWhat} trackWhat - what to track, e.g. trackEdit, trackView, trackDeleted
 */
export const addParentToLocals = (res, parent: string, collection: string, trackWhat: TtrackWhat) => {
  if (!res.locals.parentsWithCollections) {
    res.locals.parentsWithCollections = [];
  }

  res.locals.parentsWithCollections.push({ parent, collection, trackWhat });
};


export const clearFsFiles = () => {

};

// TODO
export const hasValidIdsInRequest = (req, res, next) => {
  const idStrings: string[] = [];
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
    const isValid = verifyObjectIds(idStrings);

    if (!isValid) {
      trackerLogger.error('hasValidIdsInRequest idStrings', idStrings);

      return res.status(401).send({ success: false, err: 'unauthorised' });
    }
  }

  return next();
};


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
export const isDocDeleted = async(req, res, next) => {
  const parents: string[] = [];

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
    const found = await trackDeletedLean.find({ parent: { $in: parents } }).lean();

    if (found.length > 0) {
      trackerLogger.error('isDocDeleted length', found.length);

      return res.status(401).send({ success: false, err: 'unauthorised' });
    }
  }

  return next();
};


// TODO delete immediately

export const trackRoutes = express.Router();

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

trackRoutes.post('/gettrackviewbydate/:offset/:limit', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
  let filter: object = {};

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
    trackViewLean
      .find({
        isDeleted: false,
        ...filter
      })
      .skip(offset)
      .limit(limit)
      .lean(),
    trackViewLean.countDocuments({ isDeleted: false, ...filter })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: await transformDataWitParents(all[0])
  };

  return res.status(200).send(response);
});

trackRoutes.post('/gettrackviewbyuserdate/:offset/:limit', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
  let filter: object = {};

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
    trackViewLean
      .find({
        isDeleted: false,
        ...filter
      })
      .skip(offset)
      .limit(limit)
      .lean(),
    trackViewLean.countDocuments({ isDeleted: false, ...filter })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: await transformDataWitParents(all[0])
  };
});

trackRoutes.get('/gettrackviewbyparent/:parent', requireAuth, async(req, res) => {
  const { parent } = req.params;
  const isValid = verifyObjectId(parent);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const found = await trackViewLean.findOne({
    parent
  }).lean();

  if (!found) {
    return res.status(404).send({ success: false, status: 404, err: 'not found' });
  }

  found.users = await transformWithUserData(found.users) as IuserActionTrack[];

  return res.status(200).send(found);
});


trackRoutes.get('/gettrackeditbyparent/:parent', requireAuth, async(req, res) => {
  const { parent } = req.params;
  const isValid = verifyObjectId(parent);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const found = await trackEditLean.findOne({
    parent
  }).lean();

  if (!found) {
    return res.status(404).send({ success: false, status: 404, err: 'not found' });
  }

  found.users = await transformWithUserData(found.users) as IuserActionTrack[];

  return res.status(200).send(found);
});

trackRoutes.get('/gettrackdeletebyparent/:parent', requireAuth, async(req, res) => {
  const { parent } = req.params;
  const isValid = verifyObjectId(parent);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const found = await trackDeletedLean.findOne({
    parent
  }).lean();

  if (!found) {
    return res.status(404).send({ success: false, status: 404, err: 'not found' });
  }

  return res.status(200).send(found);
});

trackRoutes.get('/gettrackviewbyuser/:offset/:limit/:userId', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const isValid = verifyObjectId(req.params.userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const all = await Promise.all([
    trackViewLean
      .find({
        isDeleted: false,
        users: { $elemMatch: { _id: req.params.userId } }
      })
      .skip(offset)
      .limit(limit)
      .lean(),
    trackViewLean.countDocuments({ isDeleted: false, users: { $elemMatch: { _id: req.params.userId } } })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: await transformDataWitParents(all[0])
  };

  return res.status(200).send(response);
});

trackRoutes.get('/gettrackeditbyuser/:offset/:limit/:userId', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const isValid = verifyObjectId(req.params.userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const all = await Promise.all([
    trackEditLean
      .find({
        isDeleted: false,
        users: { $elemMatch: { _id: req.params.userId } }
      })
      .skip(offset)
      .limit(limit)
      .lean(),
    trackEditLean.countDocuments({ isDeleted: false, users: { $elemMatch: { _id: req.params.userId } } })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: await transformDataWitParents(all[0])
  };

  return res.status(200).send(response);
});

trackRoutes.get('/gettrackview/:offset/:limit', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const isValid = verifyObjectId(req.params.userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const all = await Promise.all([
    trackViewLean
      .find({
        users: { $elemMatch: { _id: req.params.userId } }
      })
      .skip(offset)
      .limit(limit)
      .lean(),
    trackViewLean.countDocuments({ users: { $elemMatch: { _id: req.params.userId } } })
  ]);

  const response: IdataArrayResponse = {
    count: all[1],
    data: await transformDataWitParents(all[0])
  };


  return res.status(200).send(response);
});


trackRoutes.get('/gettrackedit/:offset/:limit', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const isValid = verifyObjectId(req.params.userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const all = await Promise.all([
    trackEditLean
      .find({
        users: { $elemMatch: { _id: req.params.userId } }
      })
      .skip(offset)
      .limit(limit)
      .lean(),
    trackEditLean.countDocuments({ users: { $elemMatch: { _id: req.params.userId } } })
  ]);

  const response: IdataArrayResponse = {
    count: all[1],
    data: await transformDataWitParents(all[0])
  };

  return res.status(200).send(response);
});


trackRoutes.get('/gettrackdelete/:offset/:limit', requireAuth, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const isValid = verifyObjectId(req.params.userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const all = await Promise.all([
    trackDeletedLean
      .find({
        users: { $elemMatch: { _id: req.params.userId } }
      })
      .skip(offset)
      .limit(limit)
      .lean(),
    trackDeletedLean.countDocuments({ users: { $elemMatch: { _id: req.params.userId } } })
  ]);

  const response: IdataArrayResponse = {
    count: all[1],
    data: await transformDataWitParents(all[0])
  };


  return res.status(200).send(response);
});

trackRoutes.delete('/deletetrackdelete/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  // remove parent
});


trackRoutes.delete('/deletetrackedit/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  // remove parent
});

trackRoutes.delete('/deletetrackview/:id', requireAuth, (req, res) => {
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
const transformDataWitParents = async(data: any[]) => {
  const allWithParnet = data.map(async val => {
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
const getParentData = async(parent: string, collectionName: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filter: any[] = [{
    $project: {
      info: { $concat: [ '$user.fname', '', '$user.lname' ] }
    }
  }];

  switch (collectionName) {
    case 'users':
      filter = [
        ...lookupPhotos(),
        {
          $project: {
            info: { $concat: [ '$fname', ' ', '$lname' ] },
            urId: '$urId',
            dataType: 'user'
          }
        }
      ];
      break;
    case 'companies':
      filter = [
        ...lookupUser(),
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
        ...lookupUser(),
        {
          $project: {
            info: { $concat: [ '$user.fname', '', '$user.lname' ] },
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
        ...lookupInvoiceRelated(),
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
        ...lookupInvoiceRelated(),
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
        ...lookupInvoiceRelated(),
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
        ...lookupBillingUser(),
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
        ...lookupItems(),
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
        ...lookupItems(),
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
        ...lookupPhotos(),
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
        ...lookupPaymentRelated(),
        ...lookupInvoiceRelated(),
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
        ...lookupPaymentRelated(),
        ...lookupInvoiceRelated(),
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
        ...lookupInvoiceRelated(),
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
        ...lookupUser(),
        {
          $project: {
            info: { $concat: [ '$user.fname', '', '$user.lname' ] },
            urId: '$urId',
            dataType: 'staff'
          }
        }
      ];
      break;
  }

  const parentDataCursor = mainConnection.db.collection(collectionName)
    .aggregate([{
      $match: { _id: { $eq: new Types.ObjectId(parent) } }
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
const transformWithUserData = async(data: IuserActionTrack[]) => {
  const allWithParnet = data.map(async val => {
    val._id = await getUserData(val._id as string);

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
const getUserData = async(userId: string) => {
  const isValid = verifyObjectId(userId);

  if (!isValid) {
    return null;
  }
  // bear with me here because users can be universially easer to knnow the created collection name
  const user = await mainConnection.db.collection('users').findOne({ _id: new Types.ObjectId(userId) });

  return user as unknown as Iuser;
};


/**
   * Periodically removes all documents from all collections that have been marked as deleted
   * and have an expireDocAfter date that is older than the configured expireDocAfterSeconds.
   * @returns {Promise<void>} - A promise that resolves when all documents have been removed.
   */
export const periodicRemove = async() => {
  const dateDiff = addSecondsToDate(new Date(), -stockUniversalConfig.expireDocAfterSeconds);
  const collectionNames = await mainConnection.db.listCollections().toArray();

  for (const { name } of collectionNames) {
    mainConnection.db.collection(name).deleteMany({
      isDeleted: true,
      expireDocAfter: {
        $lt: dateDiff
      }
    });
  }
};


export const deleteLingeringFiles = async() => {

  // TODO thisis tricky since is not linked
};


/**
   * Periodically cleans up files that are marked as deleted and have expired.
   * Automatically called by the periodic task manager.
   * @returns {Promise<void>}
   */
export const autoCleanFiles = async() => {
  const dateDiff = addSecondsToDate(new Date(), -stockUniversalConfig.expireDocAfterSeconds);
  const filter = { isDeleted: true, expireDocAfter: { $lt: dateDiff } };
  const files = await fileMetaLean.find(filter).lean();

  await deleteAllFiles(files, true);
};


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
