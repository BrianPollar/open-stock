import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { IdataArrayResponse, Isuccess } from '@open-stock/stock-universal';
import {
  addParentToLocals,
  makeCompanyBasedQuery,
  offsetLimitRelegator, requireAuth,
  roleAuthorisation,
  stringifyMongooseErr
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { pickupLocationLean, pickupLocationMain } from '../../models/printables/pickuplocation.model';

/**
 * Logger for pickup location routes
 */
const pickupLocationRoutesLogger = tracer.colorConsole({
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
    fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('raw.output err ', err);
      }
    });
  }
});

/**
 * Express router for pickup location routes
 */
export const pickupLocationRoutes = express.Router();

/**
 * Route to create a new pickup location
 * @name POST /create
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
pickupLocationRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryCitys', 'create'), async(req, res) => {
  const pickupLocation = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  pickupLocation.companyId = filter.companyId;
  const newPickupLocation = new pickupLocationMain(pickupLocation);
  let errResponse: Isuccess;
  const saved = await newPickupLocation.save()
    .catch(err => {
      pickupLocationRoutesLogger.error('create - err: ', err);
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
        errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
      }

      return err;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  if (saved && saved._id) {
    addParentToLocals(res, saved._id, pickupLocationMain.collection.collectionName, 'makeTrackEdit');
  }


  return res.status(200).send({ success: Boolean(saved) });
});

/**
 * Route to update an existing pickup location
 * @name PUT /update
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
pickupLocationRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryCitys', 'update'), async(req, res) => {
  const updatedPickupLocation = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  updatedPickupLocation.companyId = filter.companyId;

  const pickupLocation = await pickupLocationMain
    .findOne({ _id: updatedPickupLocation._id, ...filter })
    .lean();

  if (!pickupLocation) {
    return res.status(404).send({ success: false });
  }

  let errResponse: Isuccess;
  const updated = await pickupLocationMain.updateOne({
    _id: updatedPickupLocation._id, ...filter
  }, {
    $set: {
      name: updatedPickupLocation.name || pickupLocation.name,
      contact: updatedPickupLocation.contact || pickupLocation.contact,
      isDeleted: updatedPickupLocation.isDeleted || pickupLocation.isDeleted
    }
  })
    .catch(err => {
      pickupLocationRoutesLogger.error('update - err: ', err);
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
        errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
      }

      return errResponse;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }

  addParentToLocals(res, pickupLocation._id, pickupLocationMain.collection.collectionName, 'makeTrackEdit');

  return res.status(200).send({ success: Boolean(updated) });
});

/**
 * Route to get a single pickup location by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
pickupLocationRoutes.get('/getone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryCitys', 'read'), async(req, res) => {
  const { id } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  const pickupLocation = await pickupLocationLean
    .findOne({ _id: id, ...filter })
    .lean();

  if (pickupLocation) {
    addParentToLocals(res, pickupLocation._id, pickupLocationMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(pickupLocation);
});

/**
 * Route to get all pickup locations with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
pickupLocationRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryCitys', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { filter } = makeCompanyBasedQuery(req);
  const all = await Promise.all([
    pickupLocationLean
      .find({ ...filter })
      .skip(offset)
      .limit(limit)
      .lean(),
    pickupLocationLean.countDocuments({ ...filter })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, pickupLocationMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

/**
 * Route to delete a single pickup location by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
pickupLocationRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryCitys', 'delete'), async(req, res) => {
  const { id } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // const deleted = await pickupLocationMain.findOneAndDelete({ _id: id, ...filter });
  const deleted = await pickupLocationMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    addParentToLocals(res, id, pickupLocationMain.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Route to search for pickup locations by a search term and key
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
pickupLocationRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryCitys', 'read'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const all = await Promise.all([
    pickupLocationLean
      .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
      .skip(offset)
      .limit(limit)
      .lean(),
    pickupLocationLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, pickupLocationMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

/**
 * Route to delete multiple pickup locations by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
pickupLocationRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('deliveryCitys', 'delete'), async(req, res) => {
  const { ids } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  /* const deleted = await pickupLocationMain
    .deleteMany({ _id: { $in: ids }, ...filter })
    .catch(err => {
      pickupLocationRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

  const deleted = await pickupLocationMain
    .updateMany({ _id: { $in: ids }, ...filter }, {
      $set: { isDeleted: true }
    })
    .catch(err => {
      pickupLocationRoutesLogger.error('deletemany - err: ', err);

      return null;
    });

  if (Boolean(deleted)) {
    for (const val of ids) {
      addParentToLocals(res, val, pickupLocationMain.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
