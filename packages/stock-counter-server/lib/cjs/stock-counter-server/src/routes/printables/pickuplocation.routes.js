"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickupLocationRoutes = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const pickuplocation_model_1 = require("../../models/printables/pickuplocation.model");
/**
 * Logger for pickup location routes
 */
const pickupLocationRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
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
exports.pickupLocationRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'create'), async (req, res) => {
    const pickupLocation = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    pickupLocation.companyId = filter.companyId;
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'makeTrackEdit');
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
exports.pickupLocationRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'update'), async (req, res) => {
    const updatedPickupLocation = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedPickupLocation.companyId = filter.companyId;
    const pickupLocation = await pickuplocation_model_1.pickupLocationMain
        .findOne({ _id: updatedPickupLocation._id, ...filter })
        .lean();
    if (!pickupLocation) {
        return res.status(404).send({ success: false });
    }
    let errResponse;
    const updated = await pickuplocation_model_1.pickupLocationMain.updateOne({
        _id: updatedPickupLocation._id, ...filter
    }, {
        $set: {
            name: updatedPickupLocation.name || pickupLocation.name,
            contact: updatedPickupLocation.contact || pickupLocation.contact,
            isDeleted: updatedPickupLocation.isDeleted || pickupLocation.isDeleted
        }
    })
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
    (0, stock_universal_server_1.addParentToLocals)(res, pickupLocation._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'makeTrackEdit');
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
exports.pickupLocationRoutes.get('/getone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'read'), async (req, res) => {
    const { id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const pickupLocation = await pickuplocation_model_1.pickupLocationLean
        .findOne({ _id: id, ...filter })
        .lean();
    if (pickupLocation) {
        (0, stock_universal_server_1.addParentToLocals)(res, pickupLocation._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataView');
    }
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
exports.pickupLocationRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        pickuplocation_model_1.pickupLocationLean
            .find({ ...filter })
            .skip(offset)
            .limit(limit)
            .lean(),
        pickuplocation_model_1.pickupLocationLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataView');
    }
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
exports.pickupLocationRoutes.delete('/deleteone/:id/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const deleted = await pickupLocationMain.findOneAndDelete({ _id: id, ...filter });
    const deleted = await pickuplocation_model_1.pickupLocationMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Route to search for pickup locations by a search term and key
 * @name POST /search/:offset/:limit
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
exports.pickupLocationRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const all = await Promise.all([
        pickuplocation_model_1.pickupLocationLean
            .find({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean(),
        pickuplocation_model_1.pickupLocationLean.countDocuments({ ...filter, [searchKey]: { $regex: searchterm, $options: 'i' } })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataView');
    }
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
exports.pickupLocationRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('deliveryCitys', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await pickupLocationMain
      .deleteMany({ _id: { $in: ids }, ...filter })
      .catch(err => {
        pickupLocationRoutesLogger.error('deletemany - err: ', err);
  
        return null;
      }); */
    const deleted = await pickuplocation_model_1.pickupLocationMain
        .updateMany({ _id: { $in: ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        pickupLocationRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, pickuplocation_model_1.pickupLocationMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=pickuplocation.routes.js.map