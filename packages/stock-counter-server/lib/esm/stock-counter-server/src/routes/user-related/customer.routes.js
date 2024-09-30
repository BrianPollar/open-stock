import { addUser, determineUserToRemove, determineUsersToRemove, populateTrackEdit, populateTrackView, removeManyUsers, removeOneUser, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord, updateUserBulk } from '@open-stock/stock-auth-server';
import { addParentToLocals, appendBody, constructFiltersFromBody, generateUrId, lookupSubFieldUserFilter, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { invoiceRelatedLean } from '../../models/printables/related/invoicerelated.model';
import { customerLean, customerMain } from '../../models/user-related/customer.model';
import { populateUser } from '../../utils/query';
/** Logger for customer routes */
const customerRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path.join(process.cwd() + '/openstockLog/');
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
   * Adds a new customer to the database.
   * @function
   * @memberof module:customerRoutes
   * @inner
   * @param {Request} req - The express request object.
   * @param {Response} res - The express response object.
   * @param {NextFunction} next - The express next function.
   * @returns {Promise} - Promise representing the saved customer
   */
export const addCustomer = async (req, res, next) => {
    const { filter } = makeCompanyBasedQuery(req);
    const { customer, user } = req.body;
    customer.user = user._id;
    customer.companyId = filter.companyId;
    customer.urId = await generateUrId(customerMain);
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        addParentToLocals(res, saved._id, customerMain.collection.collectionName, 'makeTrackEdit');
    }
    return next();
};
/**
   * Updates a customer by ID.
   * @name PUT /updateone
   * @function
   * @memberof module:customerRoutes
   * @inner
   * @param {string} path - Express path
   * @param {callback} middleware - Express middleware
   * @returns {Promise} - Promise representing the update result
   */
export const updateCustomer = async (req, res) => {
    const updatedCustomer = req.body.customer;
    const { filter } = makeCompanyBasedQuery(req);
    updatedCustomer.companyId = filter.companyId;
    const customer = await customerMain
        .findOne({ _id: updatedCustomer._id, ...filter })
        .lean();
    if (!customer) {
        return res.status(404).send({ success: false });
    }
    let errResponse;
    const updated = await customerMain.updateOne({
        _id: updatedCustomer._id, ...filter
    }, {
        $set: {
            startDate: updatedCustomer.startDate || customer.startDate,
            endDate: updatedCustomer.endDate || customer.endDate,
            occupation: updatedCustomer.occupation || customer.occupation,
            otherAddresses: updatedCustomer.otherAddresses || customer.otherAddresses,
            isDeleted: updatedCustomer.isDeleted || customer.isDeleted
        }
    })
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
    addParentToLocals(res, customer._id, customerMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
};
/**
 * Router for handling customer-related routes.
 */
export const customerRoutes = express.Router();
customerRoutes.post('/add', requireAuth, requireActiveCompany, requireCanUseFeature('customer'), roleAuthorisation('users', 'create'), addUser, addCustomer, requireUpdateSubscriptionRecord('customer'));
customerRoutes.post('/add/img', requireAuth, requireActiveCompany, requireCanUseFeature('customer'), roleAuthorisation('users', 'create'), uploadFiles, appendBody, saveMetaToDb, addUser, addCustomer, requireUpdateSubscriptionRecord('customer'));
customerRoutes.post('/one', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'read'), async (req, res) => {
    const { _id, userId } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    let filter2 = {};
    if (_id) {
        const isValid = verifyObjectIds([_id]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, _id };
    }
    /* if (companyId) {
    filter = { ...filter, ...filter };
  } */
    if (userId) {
        const isValid = verifyObjectIds([userId]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, user: userId };
    }
    const customer = await customerLean
        .findOne({ ...filter2, ...filter })
        .populate([populateUser(), populateTrackEdit(), populateTrackView()])
        .lean();
    if (!customer) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, customer._id, customerMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(customer);
});
customerRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        customerLean
            .find({ ...filter })
            .populate([populateUser(), populateTrackEdit(), populateTrackView()])
            .skip(offset)
            .limit(limit)
            .lean(),
        customerLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, customerMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
customerRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = customerLean
        .aggregate([
        ...lookupSubFieldUserFilter(constructFiltersFromBody(req), propSort, offset, limit)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const staffsToReturn = all.filter(val => val.user);
    const response = {
        count,
        data: staffsToReturn
    };
    for (const val of staffsToReturn) {
        addParentToLocals(res, val._id, customerMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
customerRoutes.put('/update', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'update'), updateUserBulk, updateCustomer);
customerRoutes.post('/update/img', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'update'), uploadFiles, appendBody, saveMetaToDb, updateUserBulk, updateCustomer);
customerRoutes.put('/delete/one', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'delete'), determineUserToRemove(customerLean, [{
        model: invoiceRelatedLean,
        field: 'billingUserId',
        errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
    }]), removeOneUser, async (req, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    // const deleted = await customerMain.findOneAndDelete({ _id, ...filter });
    const deleted = await customerMain
        .updateOne({ _id, ...filter }, { $set: { isDeleted: true } }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        addParentToLocals(res, _id, customerMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
customerRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('customers', 'delete'), determineUsersToRemove(customerLean, [{
        model: invoiceRelatedLean,
        field: 'billingUserId',
        errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
    }]), removeManyUsers, async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    /* const deleted = await customerMain
    .deleteMany({ ...filter, _id: { $in: _ids } })
    .catch(err => {
      customerRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await customerMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        customerRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            addParentToLocals(res, val, customerMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=customer.routes.js.map