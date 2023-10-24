"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const customer_model_1 = require("../../models/user-related/customer.model");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const locluser_routes_1 = require("./locluser.routes");
/** Logger for customer routes */
const customerRoutesLogger = (0, log4js_1.getLogger)('routes/customerRoutes');
/** Express router for customer routes */
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
exports.customerRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users'), async (req, res) => {
    const customer = req.body.customer;
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
    const saved = await newCustomer.save()
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
    return res.status(200).send({ success: Boolean(saved) });
});
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
exports.customerRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const customer = await customer_model_1.customerLean
        .findById(id)
        .populate({ path: 'user', model: stock_auth_server_1.userLean })
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
exports.customerRoutes.get('/getall/:offset/:limit', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const customers = await customer_model_1.customerLean
        .find({})
        .populate({ path: 'user', model: stock_auth_server_1.userLean })
        .skip(offset)
        .limit(limit)
        .lean();
    console.log('What to return is', customers);
    return res.status(200).send(customers);
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
exports.customerRoutes.put('/update', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users'), async (req, res) => {
    const updatedCustomer = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(updatedCustomer._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const customer = await customer_model_1.customerMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(updatedCustomer._id);
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
});
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
exports.customerRoutes.put('/deleteone', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users'), locluser_routes_1.removeOneUser, stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await customer_model_1.customerMain.findByIdAndDelete(id);
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
exports.customerRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users'), locluser_routes_1.removeManyUsers, stock_universal_server_1.deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const deleted = await customer_model_1.customerMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
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