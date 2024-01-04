/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getLogger } from 'log4js';
import { deleteFiles, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { customerLean, customerMain } from '../../models/user-related/customer.model';
import { userLean } from '@open-stock/stock-auth-server';
import { removeManyUsers, removeOneUser } from './locluser.routes';
/** Logger for customer routes */
const customerRoutesLogger = getLogger('routes/customerRoutes');
/**
 * Router for handling customer-related routes.
 */
export const customerRoutes = express.Router();
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
customerRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('users', 'create'), async (req, res) => {
    const customer = req.body.customer;
    const newCustomer = new customerMain(customer);
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
customerRoutes.get('/getone/:id/:companyIdParam', async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const customer = await customerLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
        .populate({ path: 'user', model: userLean })
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
customerRoutes.get('/getall/:offset/:limit/:companyIdParam', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const customers = await customerLean
        .find({ companyId: queryId })
        .populate({ path: 'user', model: userLean })
        .skip(offset)
        .limit(limit)
        .lean();
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
customerRoutes.put('/update/:companyIdParam', requireAuth, roleAuthorisation('users', 'update'), async (req, res) => {
    const updatedCustomer = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedCustomer.companyId = queryId;
    const isValid = verifyObjectId(updatedCustomer._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const customer = await customerMain
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
customerRoutes.put('/deleteone/:companyIdParam', requireAuth, roleAuthorisation('users', 'delete'), removeOneUser, deleteFiles, async (req, res) => {
    const { id } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await customerMain.findOneAndDelete({ _id: id, companyId: queryId });
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
customerRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('users', 'delete'), removeManyUsers, deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const deleted = await customerMain
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