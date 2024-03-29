import { offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { deliverycityLean, deliverycityMain } from '../models/deliverycity.model';
/**
 * Logger for deliverycity routes
 */
const deliverycityRoutesLogger = getLogger('routes/deliverycityRoutes');
/**
 * Express router for deliverycity routes
 */
export const deliverycityRoutes = express.Router();
/**
 * Route for creating a new delivery city
 * @name POST /create
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} req.body.deliverycity - Delivery city object to create
 * @returns {Object} - Returns a success object with a boolean indicating if the city was saved successfully
 */
deliverycityRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('items', 'create'), async (req, res) => {
    const deliverycity = req.body.deliverycity;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    deliverycity.companyId = queryId;
    const newDeliverycity = new deliverycityMain(deliverycity);
    newDeliverycity.companyId = queryId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    let errResponse;
    const saved = await newDeliverycity.save()
        .catch(err => {
        deliverycityRoutesLogger.error('create - err: ', err);
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
 * Route for getting a delivery city by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.id - ID of the delivery city to retrieve
 * @returns {Object} - Returns the delivery city object
 */
deliverycityRoutes.get('/getone/:id/:companyIdParam', async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deliverycity = await deliverycityLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
        .lean();
    return res.status(200).send(deliverycity);
});
/**
 * Route for getting all delivery cities with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.offset - Offset for pagination
 * @param {string} req.params.limit - Limit for pagination
 * @returns {Object[]} - Returns an array of delivery city objects
 */
deliverycityRoutes.get('/getall/:offset/:limit/:companyIdParam', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        deliverycityLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean(),
        deliverycityLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
/**
 * Route for updating a delivery city by ID
 * @name PUT /update
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} req.body - Updated delivery city object
 * @returns {Object} - Returns a success object with a boolean indicating if the city was updated successfully
 */
deliverycityRoutes.put('/update/:companyIdParam', requireAuth, roleAuthorisation('items', 'update'), async (req, res) => {
    const updatedCity = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedCity.companyId = queryId;
    const isValid = verifyObjectIds([updatedCity._id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deliverycity = await deliverycityMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: updatedCity._id, companyId: queryId });
    if (!deliverycity) {
        return res.status(404).send({ success: false });
    }
    deliverycity.name = updatedCity.name || deliverycity.name;
    deliverycity.shippingCost = updatedCity.shippingCost || deliverycity.shippingCost;
    deliverycity.currency = updatedCity.currency || deliverycity.currency;
    deliverycity.deliversInDays = updatedCity.deliversInDays || deliverycity.deliversInDays;
    let errResponse;
    const updated = await deliverycity.save()
        .catch(err => {
        deliverycityRoutesLogger.error('update - err: ', err);
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
 * Route for deleting a delivery city by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.params.id - ID of the delivery city to delete
 * @returns {Object} - Returns a success object with a boolean indicating if the city was deleted successfully
 */
deliverycityRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, roleAuthorisation('items', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await deliverycityMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
/**
 * Route for deleting multiple delivery cities by ID
 * @name PUT /deletemany
 * @function
 * @memberof module:deliverycityRoutes
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string[]} req.body.ids - Array of IDs of the delivery cities to delete
 * @returns {Object} - Returns a success object with a boolean indicating if the cities were deleted successfully
 */
deliverycityRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('items', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await deliverycityMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids }, companyId: queryId })
        .catch(err => {
        deliverycityRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=deliverycity.routes.js.map