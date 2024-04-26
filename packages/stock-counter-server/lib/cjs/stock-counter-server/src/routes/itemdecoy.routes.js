"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemDecoyRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const item_model_1 = require("../models/item.model");
const itemdecoy_model_1 = require("../models/itemdecoy.model");
/** Logger for item decoy routes */
const itemDecoyRoutesLogger = (0, log4js_1.getLogger)('routes/itemDecoyRoutes');
/**
 * Router for item decoy routes.
 */
exports.itemDecoyRoutes = express_1.default.Router();
/**
 * Create a new item decoy.
 * @param {string} how - The type of decoy to create.
 * @param {Object} itemdecoy - The decoy object to create.
 * @returns {Promise<Isuccess>} A promise that resolves to a success object.
 */
exports.itemDecoyRoutes.post('/create/:how/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('decoy'), (0, stock_universal_server_1.roleAuthorisation)('decoys', 'create'), async (req, res, next) => {
    const { how } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { itemdecoy } = req.body;
    itemdecoy.companyId = queryId;
    // Get the count of existing decoys and generate a new urId
    const count = await itemdecoy_model_1.itemDecoyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    let decoy;
    if (how === 'automatic') {
        // If creating an automatic decoy, verify the item ID and find the item
        const isValid = (0, stock_universal_server_1.verifyObjectId)(itemdecoy.items[0]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const found = await item_model_1.itemLean.findById(itemdecoy.items[0])
            .lean();
        if (!found) {
            return res.status(404).send({ success: false });
        }
        // Find the items with the minimum and maximum selling prices
        const minItem = await item_model_1.itemLean.find({})
            .lte('costMeta.sellingPrice', Number(found.costMeta.sellingPrice))
            .sort({ createdAt: -1 })
            .limit(1);
        const maxItem = await item_model_1.itemLean.find({})
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
    const newDecoy = new itemdecoy_model_1.itemDecoyMain(decoy);
    let errResponse;
    const saved = await newDecoy.save()
        .catch(err => {
        itemDecoyRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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
}, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('decoy'));
/**
 * Get a list of all item decoys.
 * @param {string} offset - The offset to start at.
 * @param {string} limit - The maximum number of items to return.
 * @returns {Promise<Object[]>} A promise that resolves to an array of item decoys.
 */
exports.itemDecoyRoutes.get('/getall/:offset/:limit/:companyIdParam', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyIdParam } = req.params;
    let filter = {};
    console.log('GETTING DECOYS ', companyIdParam);
    if (companyIdParam) {
        console.log('GOT PARA');
        const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter = { companyId: companyIdParam };
    }
    const all = await Promise.all([
        itemdecoy_model_1.itemDecoyLean
            .find(filter)
            .skip(offset)
            .limit(limit)
            .populate({
            path: 'items', model: item_model_1.itemLean,
            populate: [{
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                }
            ]
        })
            .lean(),
        itemdecoy_model_1.itemDecoyLean.countDocuments(filter)
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
exports.itemDecoyRoutes.get('/getone/:id/:companyIdParam', async (req, res) => {
    const { id } = req.params;
    const { companyIdParam } = req.params;
    let ids;
    if (companyIdParam) {
        ids = [id, companyIdParam];
    }
    else {
        ids = [id];
    }
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const items = await itemdecoy_model_1.itemDecoyLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id })
        .populate({
        path: 'items', model: item_model_1.itemLean,
        populate: [{
                // eslint-disable-next-line @typescript-eslint/naming-convention
                path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
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
exports.itemDecoyRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('decoys', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await itemdecoy_model_1.itemDecoyMain.findOneAndDelete({ _id: id, companyId: queryId });
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
exports.itemDecoyRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('decoys', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemdecoy_model_1.itemDecoyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
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