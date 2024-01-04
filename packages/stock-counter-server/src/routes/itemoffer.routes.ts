/* eslint-disable @typescript-eslint/no-misused-promises */
import { fileMetaLean, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { itemOfferLean, itemOfferMain } from '../models/itemoffer.model';
import { itemLean } from '../models/item.model';
import { Icustomrequest, Isuccess } from '@open-stock/stock-universal';

/** Logger for item offer routes */
const itemOfferRoutesLogger = getLogger('routes/itemOfferRoutes');

/**
 * Router for item offers.
 */
export const itemOfferRoutes = express.Router();

/**
 * Route for creating a new item offer
 * @name POST /create
 * @function
 * @memberof module:routes/itemOfferRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise representing the result of the HTTP request
 */
itemOfferRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('items', 'create'), async(req, res) => {
  const { itemoffer } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  itemoffer.companyId = queryId;
  const count = await itemOfferMain
  // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
  itemoffer.urId = makeUrId(Number(count[0]?.urId || '0'));
  const newDecoy = new itemOfferMain(itemoffer);
  let errResponse: Isuccess;
  const saved = await newDecoy.save()
    .catch(err => {
      itemOfferRoutesLogger.error('create - err: ', err);
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
 * Route for getting all item offers
 * @name GET /getall/:type/:offset/:limit
 * @function
 * @memberof module:routes/itemOfferRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise representing the result of the HTTP request
 */
itemOfferRoutes.get('/getall/:type/:offset/:limit/:companyIdParam', async(req, res) => {
  const { type } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  let filter: any = { companyId };
  if (type !== 'all') {
    filter = { type, companyId };
  }
  const items = await itemOfferLean
    .find(filter)
    .skip(offset)
    .limit(limit)
    .populate({
      path: 'items', model: itemLean,
      populate: [{
        path: 'photos', model: fileMetaLean, transform: (doc) => doc.url
      }
      ]
    })
    .lean();
  return res.status(200).send(items);
});

/**
 * Route for getting a single item offer by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:routes/itemOfferRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise representing the result of the HTTP request
 */
itemOfferRoutes.get('/getone/:id/:companyIdParam', async(req, res) => {
  const { id } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const items = await itemOfferLean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOne({ _id: id, companyId: queryId })
    .populate({
      path: 'items', model: itemLean,
      populate: [{
        path: 'photos', model: fileMetaLean, transform: (doc) => doc.url
      }
      ]
    })
    .lean();
  return res.status(200).send(items);
});

/**
 * Route for deleting a single item offer by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:routes/itemOfferRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise representing the result of the HTTP request
 */
itemOfferRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, roleAuthorisation('items', 'delete'), async(req, res) => {
  const { id } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await itemOfferMain.findOneAndDelete({ _id: id, companyId: queryId });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

/**
 * Route for deleting multiple item offers by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:routes/itemOfferRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>} - Promise representing the result of the HTTP request
 */
itemOfferRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('items', 'delete'), async(req, res) => {
  const { ids } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([...ids, ...[queryId]]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await itemOfferMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids }, companyId: queryId })
    .catch(err => {
      itemOfferRoutesLogger.error('deletemany - err: ', err);
      return null;
    });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});
