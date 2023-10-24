"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemOfferRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const itemoffer_model_1 = require("../models/itemoffer.model");
const item_model_1 = require("../models/item.model");
/** Logger for item offer routes */
const itemOfferRoutesLogger = (0, log4js_1.getLogger)('routes/itemOfferRoutes');
/** Express router for item offer routes */
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
exports.itemOfferRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { itemoffer } = req.body;
    const count = await itemoffer_model_1.itemOfferMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
exports.itemOfferRoutes.get('/getall/:type/:offset/:limit', async (req, res) => {
    const { type } = req.params;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    let filter = {};
    if (type !== 'all') {
        filter = { type };
    }
    const items = await itemoffer_model_1.itemOfferLean
        .find(filter)
        .skip(offset)
        .limit(limit)
        .populate({ path: 'items', model: item_model_1.itemLean })
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
exports.itemOfferRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const items = await itemoffer_model_1.itemOfferLean
        .findById(id)
        .populate({ path: 'items', model: item_model_1.itemLean })
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
exports.itemOfferRoutes.delete('/deleteone/:id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemoffer_model_1.itemOfferMain.findByIdAndDelete(id);
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
exports.itemOfferRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { ids } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await itemoffer_model_1.itemOfferMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
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