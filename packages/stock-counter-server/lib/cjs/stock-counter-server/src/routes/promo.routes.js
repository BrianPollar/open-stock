"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
Object.defineProperty(exports, "__esModule", { value: true });
exports.promocodeRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const promocode_model_1 = require("../models/promocode.model");
/** Logger for promocode routes */
const promocodeRoutesLogger = (0, log4js_1.getLogger)('routes/promocodeRoutes');
/**
 * Router for handling promo code routes.
 */
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
exports.promocodeRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'create'), async (req, res) => {
    const { items, amount, roomId } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const code = (0, stock_universal_1.makeRandomString)(8, 'combined');
    const count = await promocode_model_1.promocodeMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const promocode = {
        urId,
        companyId,
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
exports.promocodeRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'read'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const promocode = await promocode_model_1.promocodeLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
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
exports.promocodeRoutes.get('/getonebycode/:code/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { code } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const promocode = await promocode_model_1.promocodeLean
        .findOne({ code, companyId: queryId })
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
exports.promocodeRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        promocode_model_1.promocodeLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean(),
        promocode_model_1.promocodeLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
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
exports.promocodeRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await promocode_model_1.promocodeMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=promo.routes.js.map