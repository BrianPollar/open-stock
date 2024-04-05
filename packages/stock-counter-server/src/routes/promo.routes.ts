/* eslint-disable @typescript-eslint/no-misused-promises */

import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { Icustomrequest, IdataArrayResponse, Isuccess, makeRandomString } from '@open-stock/stock-universal';
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { promocodeLean, promocodeMain } from '../models/promocode.model';

/** Logger for promocode routes */
const promocodeRoutesLogger = getLogger('routes/promocodeRoutes');

/**
 * Router for handling promo code routes.
 */
export const promocodeRoutes = express.Router();

/**
 * Route for creating a new promocode
 * @name POST /create
 * @function
 * @memberof module:routes/promocodeRoutes
 * @inner
 * @param {string[]} items - Array of item IDs that the promocode applies to
 * @param {number} amount - Discount amount in cents
 * @param {string} roomId - ID of the room the promocode applies to
 * @returns {Promise<Isuccess>} - Promise representing the success or failure of the operation
 */
promocodeRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'create'), async(req, res) => {
  const { items, amount, roomId } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const code = makeRandomString(8, 'combined');
  const count = await promocodeMain
  // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
  const urId = makeUrId(Number(count[0]?.urId || '0'));
  const promocode = {
    urId,
    companyId,
    code,
    amount,
    items,
    roomId,
    expireAt: new Date().toString()
  };
  const newpromocode = new promocodeMain(promocode);
  let errResponse: Isuccess;
  const saved = await newpromocode.save()
    .catch(err => {
      promocodeRoutesLogger.error('create - err: ', err);
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
  return res.status(200).send({ success: Boolean(saved), code });
});

/**
 * Route for getting a single promocode by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:routes/promocodeRoutes
 * @inner
 * @param {string} id - ID of the promocode to retrieve
 * @returns {Promise<object>} - Promise representing the retrieved promocode
 */
promocodeRoutes.get('/getone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'read'), async(req, res) => {
  const { id } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const promocode = await promocodeLean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOne({ _id: id, companyId: queryId })
    .lean();
  return res.status(200).send(promocode);
});

/**
 * Route for getting a single promocode by code
 * @name GET /getonebycode/:code
 * @function
 * @memberof module:routes/promocodeRoutes
 * @inner
 * @param {string} code - Code of the promocode to retrieve
 * @returns {Promise<object>} - Promise representing the retrieved promocode
 */
promocodeRoutes.get('/getonebycode/:code/:companyIdParam', requireAuth, async(req, res) => {
  const { code } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const promocode = await promocodeLean
    .findOne({ code, companyId: queryId })
    .lean();
  return res.status(200).send(promocode);
});

/**
 * Route for getting all promocodes with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:routes/promocodeRoutes
 * @inner
 * @param {string} offset - Offset for pagination
 * @param {string} limit - Limit for pagination
 * @returns {Promise<object[]>} - Promise representing the retrieved promocodes
 */
promocodeRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'read'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const all = await Promise.all([
    promocodeLean
      .find({ companyId: queryId })
      .skip(offset)
      .limit(limit)
      .lean(),
    promocodeLean.countDocuments({ companyId: queryId })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };
  return res.status(200).send(response);
});

/**
 * Route for deleting a single promocode by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:routes/promocodeRoutes
 * @inner
 * @param {string} id - ID of the promocode to delete
 * @returns {Promise<Isuccess>} - Promise representing the success or failure of the operation
 */
promocodeRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'delete'), async(req, res) => {
  const { id } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await promocodeMain.findOneAndDelete({ _id: id, companyId: queryId });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});
