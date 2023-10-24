/* eslint-disable @typescript-eslint/no-misused-promises */
import { makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { itemLimittedLean, itemLimittedMain } from '../models/itemlimitted.model';
/** Logger for itemLimittedRoutes */
const itemLimittedRoutesLogger = getLogger('routes/itemLimittedRoutes');
/** Express router for itemLimitted */
export const itemLimittedRoutes = express.Router();
/**
 * Create a new itemlimitted
 * @name POST /create
 * @function
 * @memberof module:routes/itemLimittedRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Isuccess} - Success status and error message if applicable
 */
itemLimittedRoutes.post('/create', requireAuth, roleAuthorisation('items'), async (req, res) => {
    const { itemlimitted } = req.body;
    const count = await itemLimittedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = makeUrId(Number(count[0]?.urId || '0'));
    itemlimitted.urId = urId;
    const newItemlimitted = new itemLimittedMain(itemlimitted);
    let errResponse;
    const saved = await newItemlimitted.save()
        .catch(err => {
        itemLimittedRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
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
 * Get all itemlimitteds
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:routes/itemLimittedRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Object[]} - Array of itemlimitted objects
 */
itemLimittedRoutes.get('/getall/:offset/:limit', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const items = await itemLimittedLean
        .find({})
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(items);
});
/**
 * Get a single itemlimitted by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:routes/itemLimittedRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Object} - itemlimitted object
 */
itemLimittedRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const items = await itemLimittedLean
        .findById(id)
        .lean();
    return res.status(200).send(items);
});
/**
 * Delete a single itemlimitted by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:routes/itemLimittedRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Isuccess} - Success status and error message if applicable
 */
itemLimittedRoutes.delete('/deleteone/:id', requireAuth, roleAuthorisation('items'), async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemLimittedMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Update a single itemlimitted by ID
 * @name PUT /updateone
 * @function
 * @memberof module:routes/itemLimittedRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Isuccess} - Success status and error message if applicable
 */
itemLimittedRoutes.put('/updateone', requireAuth, roleAuthorisation('items'), async (req, res) => {
    const isValid = verifyObjectId(req.body._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemLimittedMain.findByIdAndUpdate(req.body._id);
    item.name = req.body.name;
    await item.save();
    return res.status(200).send({ success: true });
});
/**
 * Delete multiple itemlimitteds by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:routes/itemLimittedRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Isuccess} - Success status and error message if applicable
 */
itemLimittedRoutes.put('/deletemany', requireAuth, roleAuthorisation('items'), async (req, res) => {
    const { ids } = req.body;
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemLimittedMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
        .catch(err => {
        itemLimittedRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=itemlimitted.routes.js.map