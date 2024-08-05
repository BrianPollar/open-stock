/* eslint-disable @typescript-eslint/no-misused-promises */
import { requireSuperAdmin } from '@open-stock/stock-auth-server';
import { Icustomrequest, IdataArrayResponse, Isuccess } from '@open-stock/stock-universal';
import { offsetLimitRelegator, requireAuth, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { deliverycityLean, deliverycityMain } from '../models/deliverycity.model';

/**
 * Logger for deliverycity routes
 */
const deliverycityRoutesLogger = tracer.colorConsole({
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
 * Express router for deliverycity routes
 */
export const deliverycityRoutes = express.Router();

/**
 * Route for creating a new delivery city
 * @name POST /create
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} req.body.deliverycity - Delivery city object to create
 * @returns {Object} - Returns a success object with a boolean indicating if the city was saved successfully
 */
deliverycityRoutes.post('/create/:companyIdParam', requireAuth, requireSuperAdmin, async(req, res) => {
  const deliverycity = req.body.deliverycity;
  const newDeliverycity = new deliverycityMain(deliverycity);
  let errResponse: Isuccess;
  const saved = await newDeliverycity.save()
    .catch(err => {
      deliverycityRoutesLogger.error('create - err: ', err);
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
 * Route for getting a delivery city by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.id - ID of the delivery city to retrieve
 * @returns {Object} - Returns the delivery city object
 */
deliverycityRoutes.get('/getone/:id/:companyIdParam', async(req, res) => {
  const { id } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const deliverycity = await deliverycityLean
    .findOne({ _id: id, companyId: queryId })
    .lean();

  return res.status(200).send(deliverycity);
});

/**
 * Route for getting all delivery cities with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.offset - Offset for pagination
 * @param {string} req.params.limit - Limit for pagination
 * @returns {Object[]} - Returns an array of delivery city objects
 */
deliverycityRoutes.get('/getall/:offset/:limit/:companyIdParam', async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const all = await Promise.all([
    deliverycityLean
      .find({ })
      .skip(offset)
      .limit(limit)
      .lean(),
    deliverycityLean.countDocuments({ })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  return res.status(200).send(response);
});

/**
 * Route for updating a delivery city by ID
 * @name PUT /update
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} req.body - Updated delivery city object
 * @returns {Object} - Returns a success object with a boolean indicating if the city was updated successfully
 */
deliverycityRoutes.put('/update/:companyIdParam', requireAuth, requireSuperAdmin, async(req, res) => {
  const updatedCity = req.body;
  const isValid = verifyObjectIds([updatedCity._id]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const deliverycity = await deliverycityMain
    .findOneAndUpdate({ _id: updatedCity._id });

  if (!deliverycity) {
    return res.status(404).send({ success: false });
  }
  deliverycity.name = updatedCity.name || deliverycity.name;
  deliverycity.shippingCost = updatedCity.shippingCost || deliverycity.shippingCost;
  deliverycity.currency = updatedCity.currency || deliverycity.currency;
  deliverycity.deliversInDays = updatedCity.deliversInDays || deliverycity.deliversInDays;
  let errResponse: Isuccess;
  const updated = await deliverycity.save()
    .catch(err => {
      deliverycityRoutesLogger.error('update - err: ', err);
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
 * Route for deleting a delivery city by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.id - ID of the delivery city to delete
 * @returns {Object} - Returns a success object with a boolean indicating if the city was deleted successfully
 */
deliverycityRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireSuperAdmin, async(req, res) => {
  const { id } = req.params;
  const isValid = verifyObjectIds([id]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await deliverycityMain.findOneAndDelete({ _id: id });

  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Route for deleting multiple delivery cities by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string[]} req.body.ids - Array of IDs of the delivery cities to delete
 * @returns {Object} - Returns a success object with a boolean indicating if the cities were deleted successfully
 */
deliverycityRoutes.put('/deletemany/:companyIdParam', requireAuth, requireSuperAdmin, async(req, res) => {
  const { ids } = req.body;
  const isValid = verifyObjectIds([...ids]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await deliverycityMain
    .deleteMany({ _id: { $in: ids } })
    .catch(err => {
      deliverycityRoutesLogger.error('deletemany - err: ', err);

      return null;
    });

  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
