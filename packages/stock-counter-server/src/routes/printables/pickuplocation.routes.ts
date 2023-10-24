import express from 'express';
import { offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { pickupLocationLean, pickupLocationMain } from '../../models/printables/pickuplocation.model';
import { getLogger } from 'log4js';
import { Isuccess } from '@open-stock/stock-universal';

/**
 * Logger for pickup location routes
 */
const pickupLocationRoutesLogger = getLogger('routes/pickupLocationRoutes');

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
pickupLocationRoutes.post('/create', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const pickupLocation = req.body;
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
      return errResponse;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
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
pickupLocationRoutes.put('/update', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const updatedPickupLocation = req.body;
  const isValid = verifyObjectId(updatedPickupLocation._id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const pickupLocation = await pickupLocationMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findByIdAndUpdate(updatedPickupLocation._id);
  if (!pickupLocation) {
    return res.status(404).send({ success: false });
  }
  pickupLocation.name = updatedPickupLocation.name || pickupLocation.name;
  pickupLocation.contact = updatedPickupLocation.contact || pickupLocation.contact;
  let errResponse: Isuccess;
  const updated = await pickupLocation.save()
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
pickupLocationRoutes.get('/getone/:id', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const { id } = req.params;
  const isValid = verifyObjectId(id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const pickupLocation = await pickupLocationLean
    .findById(id)
    .lean();
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
pickupLocationRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const pickupLocations = await pickupLocationLean
    .find({})
    .skip(offset)
    .limit(limit)
    .lean();
  return res.status(200).send(pickupLocations);
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
pickupLocationRoutes.delete('/deleteone/:id', requireAuth, async(req, res) => {
  const { id } = req.params;
  const isValid = verifyObjectId(id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const deleted = await pickupLocationMain.findByIdAndDelete(id);
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Route to search for pickup locations by a search term and key
 * @name POST /search/:limit/:offset
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
pickupLocationRoutes.post('/search/:limit/:offset', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const { searchterm, searchKey } = req.body;
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const pickupLocations = await pickupLocationLean
    .find({ [searchKey]: { $regex: searchterm, $options: 'i' } })
    .skip(offset)
    .limit(limit)
    .lean();
  return res.status(200).send(pickupLocations);
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
pickupLocationRoutes.put('/deletemany', requireAuth, roleAuthorisation('printables'), async(req, res) => {
  const { ids } = req.body;
  const isValid = verifyObjectIds(ids);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await pickupLocationMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids } })
    .catch(err => {
      pickupLocationRoutesLogger.error('deletemany - err: ', err);
      return null;
    });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
