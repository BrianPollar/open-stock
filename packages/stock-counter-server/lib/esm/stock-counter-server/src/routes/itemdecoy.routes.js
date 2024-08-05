import { requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord } from '@open-stock/stock-auth-server';
import { fileMetaLean, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { itemLean } from '../models/item.model';
import { itemDecoyLean, itemDecoyMain } from '../models/itemdecoy.model';
/** Logger for item decoy routes */
const itemDecoyRoutesLogger = tracer.colorConsole({
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
 * Router for item decoy routes.
 */
export const itemDecoyRoutes = express.Router();
/**
 * Create a new item decoy.
 * @param {string} how - The type of decoy to create.
 * @param {Object} itemdecoy - The decoy object to create.
 * @returns {Promise<Isuccess>} A promise that resolves to a success object.
 */
itemDecoyRoutes.post('/create/:how/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('decoy'), roleAuthorisation('decoys', 'create'), async (req, res, next) => {
    const { how } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { itemdecoy } = req.body;
    itemdecoy.companyId = queryId;
    // Get the count of existing decoys and generate a new urId
    const count = await itemDecoyMain
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = makeUrId(Number(count[0]?.urId || '0'));
    let decoy;
    if (how === 'automatic') {
        // If creating an automatic decoy, verify the item ID and find the item
        const isValid = verifyObjectId(itemdecoy.items[0]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const found = await itemLean.findById(itemdecoy.items[0])
            .lean();
        if (!found) {
            return res.status(404).send({ success: false });
        }
        // Find the items with the minimum and maximum selling prices
        const minItem = await itemLean.find({})
            .lte('costMeta.sellingPrice', Number(found.costMeta.sellingPrice))
            .sort({ createdAt: -1 })
            .limit(1);
        const maxItem = await itemLean.find({})
            .gte('costMeta.sellingPrice', Number(found.costMeta.sellingPrice))
            .sort({ createdAt: 1 })
            .limit(1);
        // Create the decoy object
        decoy = {
            type: how,
            urId,
            items: [
                minItem[0]._id,
                itemdecoy.items[0],
                maxItem[0]._id
            ]
        };
    }
    else {
        // If creating a manual decoy, simply use the provided item ID
        decoy = {
            urId,
            type: how,
            items: itemdecoy.items[0]
        };
    }
    // Save the new decoy to the database
    const newDecoy = new itemDecoyMain(decoy);
    let errResponse;
    const saved = await newDecoy.save()
        .catch(err => {
        itemDecoyRoutesLogger.error('create - err: ', err);
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
    if (!Boolean(saved)) {
        return res.status(403).send('unknown error');
    }
    return next();
}, requireUpdateSubscriptionRecord('decoy'));
/**
 * Get a list of all item decoys.
 * @param {string} offset - The offset to start at.
 * @param {string} limit - The maximum number of items to return.
 * @returns {Promise<Object[]>} A promise that resolves to an array of item decoys.
 */
itemDecoyRoutes.get('/getall/:offset/:limit/:companyIdParam', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyIdParam } = req.params;
    let filter = {};
    // eslint-disable-next-line no-undefined
    if (companyIdParam !== undefined) {
        const isValid = verifyObjectId(companyIdParam);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter = { companyId: companyIdParam };
    }
    const all = await Promise.all([
        itemDecoyLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .populate({
            path: 'items', model: itemLean,
            populate: [{
                    path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                }
            ]
        })
            .lean(),
        itemDecoyLean.countDocuments(filter)
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
/**
 * Get a single item decoy by ID.
 * @param {string} id - The ID of the item decoy to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the requested item decoy.
 */
itemDecoyRoutes.get('/getone/:id/:companyIdParam', async (req, res) => {
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
    const items = await itemDecoyLean
        .findOne({ _id: id })
        .populate({
        path: 'items', model: itemLean,
        populate: [{
                path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }
        ]
    })
        .lean();
    return res.status(200).send(items);
});
/**
 * Delete a single item decoy by ID.
 * @param {string} id - The ID of the item decoy to delete.
 * @returns {Promise<Object>} A promise that resolves to a success object.
 */
itemDecoyRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('decoys', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await itemDecoyMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Delete multiple item decoys by ID.
 * @param {string[]} ids - An array of IDs of the item decoys to delete.
 * @returns {Promise<Object>} A promise that resolves to a success object.
 */
itemDecoyRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('decoys', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemDecoyMain
        .deleteMany({ _id: { $in: ids }, companyId: queryId })
        .catch(err => {
        itemDecoyRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=itemdecoy.routes.js.map