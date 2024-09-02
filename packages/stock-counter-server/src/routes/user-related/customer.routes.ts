/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  addUser, populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord, updateUserBulk
} from '@open-stock/stock-auth-server';
import { IdataArrayResponse, Isuccess } from '@open-stock/stock-universal';
import {
  addParentToLocals,
  appendBody, makeCompanyBasedQuery, makeUrId, offsetLimitRelegator,
  requireAuth,
  roleAuthorisation,
  saveMetaToDb,
  stringifyMongooseErr, uploadFiles, verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { Tcustomer, customerLean, customerMain } from '../../models/user-related/customer.model';
import { populateUser } from '../../utils/query';
import { removeManyUsers, removeOneUser } from './locluser.routes';

/** Logger for customer routes */
const customerRoutesLogger = tracer.colorConsole({
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
   * Adds a new customer to the database.
   * @function
   * @memberof module:customerRoutes
   * @inner
   * @param {Request} req - The express request object.
   * @param {Response} res - The express response object.
   * @param {NextFunction} next - The express next function.
   * @returns {Promise} - Promise representing the saved customer
   */
export const addCustomer = async(req, res, next) => {
  const { filter } = makeCompanyBasedQuery(req);

  const customer = req.body.customer;
  const savedUser = req.body.savedUser;

  customer.user = savedUser._id;
  customer.companyId = filter.companyId;

  const count = await customerMain
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 }) as unknown as Tcustomer;

  customer.urId = makeUrId(Number(count[0]?.urId || '0'));
  const newCustomer = new customerMain(customer);
  let errResponse: Isuccess;

  /**
   * Saves a new customer to the database.
   * @function
   * @memberof module:customerRoutes
   * @inner
   * @param {Customer} newCustomer - The new customer to be saved.
   * @returns {Promise} - Promise representing the saved customer
   */
  const saved = await newCustomer.save()
    .catch(err => {
      customerRoutesLogger.error('create - err: ', err);
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
    addParentToLocals(res, saved._id, customerMain.collection.collectionName, 'makeTrackEdit');
  }

  return next();
};

/**
   * Updates a customer by ID.
   * @name PUT /updateone/:companyIdParam
   * @function
   * @memberof module:customerRoutes
   * @inner
   * @param {string} path - Express path
   * @param {callback} middleware - Express middleware
   * @returns {Promise} - Promise representing the update result
   */
export const updateCustomer = async(req, res) => {
  const updatedCustomer = req.body.customer;
  const { filter } = makeCompanyBasedQuery(req);

  updatedCustomer.companyId = filter.companyId;

  const customer = await customerMain
    .findOne({ _id: updatedCustomer._id, ...filter })
    .lean();

  if (!customer) {
    return res.status(404).send({ success: false });
  }

  let errResponse: Isuccess;
  const updated = await customerMain.updateOne({
    _id: updatedCustomer._id, ...filter
  }, {
    $set: {
      startDate: updatedCustomer.startDate || customer.startDate,
      endDate: updatedCustomer.endDate || customer.endDate,
      occupation: updatedCustomer.occupation || customer.occupation,
      otherAddresses: updatedCustomer.otherAddresses || customer.otherAddresses,
      isDeleted: updatedCustomer.isDeleted || customer.isDeleted
    }
  })
    .catch(err => {
      customerRoutesLogger.error('update - err: ', err);
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

  addParentToLocals(res, customer._id, customerMain.collection.collectionName, 'makeTrackEdit');

  return res.status(200).send({ success: Boolean(updated) });
};

/**
 * Router for handling customer-related routes.
 */
export const customerRoutes = express.Router();

/**
 * Route for creating a new customer.
 * @name POST /create
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
customerRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('customer'), roleAuthorisation('users', 'create'), addUser, addCustomer, requireUpdateSubscriptionRecord('customer'));

/**
 * Route for creating a new customer.
 * @name POST /create
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
customerRoutes.post('/createimg/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('customer'), roleAuthorisation('users', 'create'), uploadFiles, appendBody, saveMetaToDb, addUser, addCustomer, requireUpdateSubscriptionRecord('customer'));

/**
 * Route for getting a single customer by ID.
 * @name GET /getone/:id
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
customerRoutes.post('/getone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'read'), async(req, res) => {
  const { id, userId } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  let filter2 = {};

  if (id) {
    const isValid = verifyObjectIds([id]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    filter2 = { ...filter2, _id: id };
  }

  /* if (queryId) {
    filter = { ...filter, ...filter };
  } */
  if (userId) {
    const isValid = verifyObjectIds([userId]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    filter2 = { ...filter2, user: userId };
  }
  const customer = await customerLean
    .findOne({ ...filter2, ...filter })
    .populate([populateUser(), populateTrackEdit(), populateTrackView()])
    .lean();

  if (customer) {
    addParentToLocals(res, customer._id, customerMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(customer);
});

/**
 * Route for getting all customers with pagination.
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
customerRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { filter } = makeCompanyBasedQuery(req);
  const all = await Promise.all([
    customerLean
      .find({ ...filter })
      .populate([populateUser(), populateTrackEdit(), populateTrackView()])
      .skip(offset)
      .limit(limit)
      .lean(),
    customerLean.countDocuments({ ...filter })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, customerMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

/**
 * Route for updating a customer.
 * @name PUT /update
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
customerRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'update'), updateUserBulk, updateCustomer);

customerRoutes.post('/updateimg/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'update'), uploadFiles, appendBody, saveMetaToDb, updateUserBulk, updateCustomer);

/**
 * Route for deleting a single customer.
 * @name PUT /deleteone
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
customerRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'delete'), removeOneUser('customer'), async(req, res) => {
  const { id } = req.body;
  const { filter } = makeCompanyBasedQuery(req);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // const deleted = await customerMain.findOneAndDelete({ _id: id, ...filter });
  const deleted = await customerMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    addParentToLocals(res, id, customerMain.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Route for deleting multiple customers.
 * @name PUT /deletemany
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
customerRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'delete'), removeManyUsers('staff'), async(req, res) => {
  const { ids } = req.body;
  const { filter } = makeCompanyBasedQuery(req);

  /* const deleted = await customerMain
    .deleteMany({ ...filter, _id: { $in: ids } })
    .catch(err => {
      customerRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */

  const deleted = await customerMain
    .updateMany({ ...filter, _id: { $in: ids } }, {
      $set: { isDeleted: true }
    })
    .catch(err => {
      customerRoutesLogger.error('deletemany - err: ', err);

      return null;
    });

  if (Boolean(deleted)) {
    for (const val of ids) {
      addParentToLocals(res, val, customerMain.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
