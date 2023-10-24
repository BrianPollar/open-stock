/* eslint-disable @typescript-eslint/no-misused-promises */

import express from 'express';
import { promocodeLean, promocodeMain } from '../models/promocode.model';
import { getLogger } from 'log4js';
import { Isuccess, makeRandomString } from '@open-stock/stock-universal';
import { makeUrId, offsetLimitRelegator, roleAuthorisation, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import { requireAuth, verifyObjectId } from '@open-stock/stock-universal-server';

/** Logger for promocode routes */
const promocodeRoutesLogger = getLogger('routes/promocodeRoutes');

/** Express router for promocode routes */
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
promocodeRoutes.post('/create', requireAuth, roleAuthorisation('items'), async(req, res) => {
  const { items, amount, roomId } = req.body;
  const code = makeRandomString(8, 'combined');
  const count = await promocodeMain
  // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
  const urId = makeUrId(Number(count[0]?.urId || '0'));
  const promocode = {
    urId,
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
promocodeRoutes.get('/getone/:id', requireAuth, roleAuthorisation('items'), async(req, res) => {
  const { id } = req.params;
  const isValid = verifyObjectId(id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const promocode = await promocodeLean
    .findById(id)
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
promocodeRoutes.get('/getonebycode/:code', requireAuth, async(req, res) => {
  const { code } = req.params;
  const promocode = await promocodeLean
    .findOne({ code })
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
promocodeRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('items'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const promocodes = await promocodeLean
    .find({})
    .skip(offset)
    .limit(limit)
    .lean();
  return res.status(200).send(promocodes);
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
promocodeRoutes.delete('/deleteone/:id', requireAuth, roleAuthorisation('items'), async(req, res) => {
  const { id } = req.params;
  const isValid = verifyObjectId(id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const deleted = await promocodeMain.findByIdAndDelete(id);
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});
