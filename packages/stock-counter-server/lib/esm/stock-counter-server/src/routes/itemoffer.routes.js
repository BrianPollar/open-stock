import { populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { addParentToLocals, appendUserToReqIfTokenExist, makeCompanyBasedQuery, makePredomFilter, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { itemOfferLean, itemOfferMain } from '../models/itemoffer.model';
import { populateItems } from '../utils/query';
/** Logger for item offer routes */
const itemOfferRoutesLogger = tracer.colorConsole({
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
    const { filter } = makeCompanyBasedQuery(req);
    itemoffer.companyId = filter.companyId;
    const count = await itemOfferMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        addParentToLocals(res, saved._id, itemOfferMain.collection.collectionName, 'makeTrackEdit');
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
itemOfferRoutes.get('/getall/:type/:offset/:limit/:companyIdParam', appendUserToReqIfTokenExist, async (req, res) => {
    const { type } = req.params;
    const { companyIdParam } = req.params;
    let query = {};
    if (companyIdParam !== 'undefined') {
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
            .find({ ...filter, ...makePredomFilter(req) })
            .skip(offset)
            .limit(limit)
            .populate([populateItems(), populateTrackEdit(), populateTrackView()])
            .lean(),
        itemOfferLean.countDocuments({ ...filter, ...makePredomFilter(req) })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, itemOfferMain.collection.collectionName, 'trackDataView');
    }
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
itemOfferRoutes.get('/getone/:id/:companyIdParam', appendUserToReqIfTokenExist, async (req, res) => {
    const { id } = req.params;
    const { companyIdParam } = req.params;
    let ids;
    if (companyIdParam !== 'undefined') {
        ids = [id, companyIdParam];
    }
    else {
        ids = [id];
    }
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const item = await itemOfferLean
        .findOne({ _id: id, ...makePredomFilter(req) })
        .populate([populateItems(), populateTrackEdit(), populateTrackView()])
        .lean();
    if (item) {
        addParentToLocals(res, item._id, itemOfferMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(item);
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
    const { filter } = makeCompanyBasedQuery(req);
    // const deleted = await itemOfferMain.findOneAndDelete({ _id: id, companyId: queryId });
    const deleted = await itemOfferMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        addParentToLocals(res, id, itemOfferMain.collection.collectionName, 'trackDataDelete');
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
    const { filter } = makeCompanyBasedQuery(req);
    /* const deleted = await itemOfferMain
      .deleteMany({ _id: { $in: ids }, companyId: queryId })
      .catch(err => {
        itemOfferRoutesLogger.error('deletemany - err: ', err);
  
        return null;
      }); */
    const deleted = await itemOfferMain
        .updateMany({ _id: { $in: ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        itemOfferRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of ids) {
            addParentToLocals(res, val._id, itemOfferMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=itemoffer.routes.js.map