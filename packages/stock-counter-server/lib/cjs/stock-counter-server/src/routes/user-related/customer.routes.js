"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutes = exports.updateCustomer = exports.addCustomer = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const customer_model_1 = require("../../models/user-related/customer.model");
const locluser_routes_1 = require("./locluser.routes");
/** Logger for customer routes */
const customerRoutesLogger = tracer.colorConsole({
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
const addCustomer = async (req, res, next) => {
    const { companyIdParam } = req.params;
    const { companyId } = req.user;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const customer = req.body.customer;
    const savedUser = req.body.savedUser;
    customer.user = savedUser._id;
    customer.companyId = queryId;
    const newCustomer = new customer_model_1.customerMain(customer);
    let errResponse;
    /**
     * Saves a new customer to the database.
     * @function
     * @memberof module:customerRoutes
     * @inner
     * @param {Customer} newCustomer - The new customer to be saved.
     * @returns {Promise} - Promise representing the saved customer
     */
    await newCustomer.save()
        .catch(err => {
        customerRoutesLogger.error('create - err: ', err);
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
    return next();
};
exports.addCustomer = addCustomer;
const updateCustomer = async (req, res) => {
    const updatedCustomer = req.body.customer;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedCustomer.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([updatedCustomer._id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const customer = await customer_model_1.customerMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: updatedCustomer._id, companyId: queryId });
    if (!customer) {
        return res.status(404).send({ success: false });
    }
    customer.startDate = updatedCustomer.startDate || customer.startDate;
    customer.endDate = updatedCustomer.endDate || customer.endDate;
    customer.occupation = updatedCustomer.occupation || customer.occupation;
    customer.otherAddresses = updatedCustomer.otherAddresses || customer.otherAddresses;
    let errResponse;
    const updated = await customer.save()
        .catch(err => {
        customerRoutesLogger.error('update - err: ', err);
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
};
exports.updateCustomer = updateCustomer;
/**
 * Router for handling customer-related routes.
 */
exports.customerRoutes = express_1.default.Router();
/**
 * Route for creating a new customer.
 * @name POST /create
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
exports.customerRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('customer'), (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_auth_server_1.addUser, exports.addCustomer, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('customer'));
/**
 * Route for creating a new customer.
 * @name POST /create
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
exports.customerRoutes.post('/createimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('customer'), (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_auth_server_1.addUser, exports.addCustomer, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('customer'));
/**
 * Route for getting a single customer by ID.
 * @name GET /getone/:id
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
exports.customerRoutes.post('/getone', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'read'), async (req, res) => {
    const { id, userId } = req.body;
    const companyIdParam = req.body.companyId;
    const { companyId } = req.user;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    let filter = {};
    if (id) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([id]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        filter = { ...filter, _id: id };
    }
    if (queryId) {
        filter = { ...filter, companyId: queryId };
    }
    if (userId) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter = { ...filter, user: userId };
    }
    const customer = await customer_model_1.customerLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne(filter)
        .populate({ path: 'user', model: stock_auth_server_1.userLean,
        populate: [{
                // eslint-disable-next-line @typescript-eslint/naming-convention
                path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }, {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }, {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
            }] })
        .lean();
    return res.status(200).send(customer);
});
/**
 * Route for getting all customers with pagination.
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
exports.customerRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const all = await Promise.all([
        customer_model_1.customerLean
            .find({ companyId: queryId })
            .populate({ path: 'user', model: stock_auth_server_1.userLean,
            populate: [{
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                }, {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                }, {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
                }]
        })
            .skip(offset)
            .limit(limit)
            .lean(),
        customer_model_1.customerLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
/**
 * Route for updating a customer.
 * @name PUT /update
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
exports.customerRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'update'), stock_auth_server_1.updateUserBulk, exports.updateCustomer);
exports.customerRoutes.put('/updateimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'update'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_auth_server_1.updateUserBulk, exports.updateCustomer);
/**
 * Route for deleting a single customer.
 * @name PUT /deleteone
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
exports.customerRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'delete'), locluser_routes_1.removeOneUser, stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await customer_model_1.customerMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Route for deleting multiple customers.
 * @name PUT /deletemany
 * @function
 * @memberof module:customerRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @param {callback} middleware - Express middleware
 * @returns {Promise} - Promise representing the HTTP response
 */
exports.customerRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'delete'), locluser_routes_1.removeManyUsers, stock_universal_server_1.deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await customer_model_1.customerMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ companyId: queryId, _id: { $in: ids } })
        .catch(err => {
        customerRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=customer.routes.js.map