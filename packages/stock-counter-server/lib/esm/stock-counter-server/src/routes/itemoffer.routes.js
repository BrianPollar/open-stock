/* eslint-disable @typescript-eslint/no-misused-promises */
import { requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { fileMetaLean, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { itemLean } from '../models/item.model';
import { itemOfferLean, itemOfferMain } from '../models/itemoffer.model';
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
itemOfferRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('offer'), roleAuthorisation('offers', 'create'), async (req, res, next) => {
    const { itemoffer } = req.body;
    const { companyId } = req.user;
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
    let errResponse;
    const saved = await newDecoy.save()
        .catch(err => {
        itemOfferRoutesLogger.error('create - err: ', err);
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
    if (Boolean(saved)) {
        return res.status(403).send('unknown error');
    }
    return next();
}, requireUpdateSubscriptionRecord('offer'));
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
itemOfferRoutes.get('/getall/:type/:offset/:limit/:companyIdParam', async (req, res) => {
    const { type } = req.params;
    const { companyIdParam } = req.params;
    let query = {};
    if (companyIdParam) {
        const isValid = verifyObjectId(companyIdParam);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        query = { companyId: companyIdParam };
    }
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    let filter;
    if (type !== 'all') {
        filter = { type, ...query };
    }
    const all = await Promise.all([
        itemOfferLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .populate({
            path: 'items', model: itemLean,
            populate: [{
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                }
            ]
        })
            .lean(),
        itemOfferLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
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
itemOfferRoutes.get('/getone/:id/:companyIdParam', async (req, res) => {
    const { id } = req.params;
    const { companyIdParam } = req.params;
    let ids;
    if (companyIdParam) {
        ids = [id, companyIdParam];
    }
    else {
        ids = [id];
    }
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const items = await itemOfferLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id })
        .populate({
        path: 'items', model: itemLean,
        populate: [{
                // eslint-disable-next-line @typescript-eslint/naming-convention
                path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
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
itemOfferRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('offers', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
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
    }
    else {
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
itemOfferRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('offers', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
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
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=itemoffer.routes.js.map