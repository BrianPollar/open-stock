"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickupLocationRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const pickuplocation_model_1 = require("../../models/printables/pickuplocation.model");
/**
 * Logger for pickup location routes
 */
const pickupLocationRoutesLogger = (0, log4js_1.getLogger)('routes/pickupLocationRoutes');
/**
 * Express router for pickup location routes
 */
exports.pickupLocationRoutes = express_1.default.Router();
/**
 * Route to create a new pickup location
 * @name POST /create
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
exports.pickupLocationRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, async (req, res) => {
    const pickupLocation = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    pickupLocation.companyId = queryId;
    const newPickupLocation = new pickuplocation_model_1.pickupLocationMain(pickupLocation);
    let errResponse;
    const saved = await newPickupLocation.save()
        .catch(err => {
        pickupLocationRoutesLogger.error('create - err: ', err);
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
 * Route to update an existing pickup location
 * @name PUT /update
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
exports.pickupLocationRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, async (req, res) => {
    const updatedPickupLocation = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedPickupLocation.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(updatedPickupLocation._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const pickupLocation = await pickuplocation_model_1.pickupLocationMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: updatedPickupLocation._id, companyId: queryId });
    if (!pickupLocation) {
        return res.status(404).send({ success: false });
    }
    pickupLocation.name = updatedPickupLocation.name || pickupLocation.name;
    pickupLocation.contact = updatedPickupLocation.contact || pickupLocation.contact;
    let errResponse;
    const updated = await pickupLocation.save()
        .catch(err => {
        pickupLocationRoutesLogger.error('update - err: ', err);
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
    return res.status(200).send({ success: Boolean(updated) });
});
/**
 * Route to get a single pickup location by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
exports.pickupLocationRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const pickupLocation = await pickuplocation_model_1.pickupLocationLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
        .lean();
    return res.status(200).send(pickupLocation);
});
/**
 * Route to get all pickup locations with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
exports.pickupLocationRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        pickuplocation_model_1.pickupLocationLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean(),
        pickuplocation_model_1.pickupLocationLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
/**
 * Route to delete a single pickup location by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
exports.pickupLocationRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await pickuplocation_model_1.pickupLocationMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Route to search for pickup locations by a search term and key
 * @name POST /search/:limit/:offset
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
exports.pickupLocationRoutes.post('/search/:limit/:offset/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        pickuplocation_model_1.pickupLocationLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean(),
        pickuplocation_model_1.pickupLocationLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
/**
 * Route to delete multiple pickup locations by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
exports.pickupLocationRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await pickuplocation_model_1.pickupLocationMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids }, companyId: queryId })
        .catch(err => {
        pickupLocationRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=pickuplocation.routes.js.map