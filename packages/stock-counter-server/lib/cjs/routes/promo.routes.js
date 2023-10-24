"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.promocodeRoutes = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const promocode_model_1 = require("../models/promocode.model");
const log4js_1 = require("log4js");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const stock_universal_server_2 = require("@open-stock/stock-universal-server");
/** Logger for promocode routes */
const promocodeRoutesLogger = (0, log4js_1.getLogger)('routes/promocodeRoutes');
/** Express router for promocode routes */
exports.promocodeRoutes = express_1.default.Router();
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
exports.promocodeRoutes.post('/create', stock_universal_server_2.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { items, amount, roomId } = req.body;
    const code = (0, stock_universal_1.makeRandomString)(8, 'combined');
    const count = await promocode_model_1.promocodeMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const promocode = {
        urId,
        code,
        amount,
        items,
        roomId,
        expireAt: new Date().toString()
    };
    const newpromocode = new promocode_model_1.promocodeMain(promocode);
    let errResponse;
    const saved = await newpromocode.save()
        .catch(err => {
        promocodeRoutesLogger.error('create - err: ', err);
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
exports.promocodeRoutes.get('/getone/:id', stock_universal_server_2.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_2.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const promocode = await promocode_model_1.promocodeLean
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
exports.promocodeRoutes.get('/getonebycode/:code', stock_universal_server_2.requireAuth, async (req, res) => {
    const { code } = req.params;
    const promocode = await promocode_model_1.promocodeLean
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
exports.promocodeRoutes.get('/getall/:offset/:limit', stock_universal_server_2.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const promocodes = await promocode_model_1.promocodeLean
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
exports.promocodeRoutes.delete('/deleteone/:id', stock_universal_server_2.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items'), async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_2.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await promocode_model_1.promocodeMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=promo.routes.js.map