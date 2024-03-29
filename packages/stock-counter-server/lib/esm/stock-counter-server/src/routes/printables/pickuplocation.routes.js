import { offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { pickupLocationLean, pickupLocationMain } from '../../models/printables/pickuplocation.model';
/**
 * Logger for pickup location routes
 */
const pickupLocationRoutesLogger = getLogger('routes/pickupLocationRoutes');
/**
 * Express router for pickup location routes
 */
export const pickupLocationRoutes = express.Router();
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
pickupLocationRoutes.post('/create/:companyIdParam', requireAuth, roleAuthorisation('printables', 'create'), async (req, res) => {
    const pickupLocation = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    pickupLocation.companyId = queryId;
    const newPickupLocation = new pickupLocationMain(pickupLocation);
    let errResponse;
    const saved = await newPickupLocation.save()
        .catch(err => {
        pickupLocationRoutesLogger.error('create - err: ', err);
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
 * Route to update an existing pickup location
 * @name PUT /update
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
pickupLocationRoutes.put('/update/:companyIdParam', requireAuth, roleAuthorisation('printables', 'update'), async (req, res) => {
    const updatedPickupLocation = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedPickupLocation.companyId = queryId;
    const isValid = verifyObjectId(updatedPickupLocation._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const pickupLocation = await pickupLocationMain
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
 * Route to get a single pickup location by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:pickupLocationRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware
 * @returns {Promise<void>}
 */
pickupLocationRoutes.get('/getone/:id/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const pickupLocation = await pickupLocationLean
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
pickupLocationRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        pickupLocationLean
            .find({ companyId: queryId })
            .skip(offset)
            .limit(limit)
            .lean(),
        pickupLocationLean.countDocuments()
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
pickupLocationRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await pickupLocationMain.findOneAndDelete({ _id: id, companyId: queryId });
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
pickupLocationRoutes.post('/search/:limit/:offset/:companyIdParam', requireAuth, roleAuthorisation('printables', 'read'), async (req, res) => {
    const { searchterm, searchKey } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
        pickupLocationLean
            .find({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
            .skip(offset)
            .limit(limit)
            .lean(),
        pickupLocationLean.countDocuments({ companyId: queryId, [searchKey]: { $regex: searchterm, $options: 'i' } })
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
pickupLocationRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('printables', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await pickupLocationMain
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