"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemOfferRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const item_model_1 = require("../models/item.model");
const itemoffer_model_1 = require("../models/itemoffer.model");
/** Logger for item offer routes */
const itemOfferRoutesLogger = (0, log4js_1.getLogger)('routes/itemOfferRoutes');
/**
 * Router for item offers.
 */
exports.itemOfferRoutes = express_1.default.Router();
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
exports.itemOfferRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('offer'), (0, stock_universal_server_1.roleAuthorisation)('items', 'create'), async (req, res, next) => {
    const { itemoffer } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    itemoffer.companyId = queryId;
    const count = await itemoffer_model_1.itemOfferMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    itemoffer.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newDecoy = new itemoffer_model_1.itemOfferMain(itemoffer);
    let errResponse;
    const saved = await newDecoy.save()
        .catch(err => {
        itemOfferRoutesLogger.error('create - err: ', err);
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
    if (Boolean(saved)) {
        return res.status(403).send('unknown error');
    }
    return next();
}, stock_auth_server_1.requireUpdateSubscriptionRecord);
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
exports.itemOfferRoutes.get('/getall/:type/:offset/:limit/:companyIdParam', async (req, res) => {
    const { type } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    let filter = { companyId };
    if (type !== 'all') {
        filter = { type, companyId };
    }
    const all = await Promise.all([
        itemoffer_model_1.itemOfferLean
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
        itemoffer_model_1.itemOfferLean.countDocuments(filter)
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
exports.itemOfferRoutes.get('/getone/:id/:companyIdParam', async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const items = await itemoffer_model_1.itemOfferLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
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
exports.itemOfferRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await itemoffer_model_1.itemOfferMain.findOneAndDelete({ _id: id, companyId: queryId });
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
exports.itemOfferRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemoffer_model_1.itemOfferMain
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