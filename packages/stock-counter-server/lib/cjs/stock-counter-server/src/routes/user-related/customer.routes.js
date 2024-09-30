"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutes = exports.updateCustomer = exports.addCustomer = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const customer_model_1 = require("../../models/user-related/customer.model");
const query_1 = require("../../utils/query");
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
const addCustomer = async (req, res, next) => {
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { customer, user } = req.body;
    customer.user = user._id;
    customer.companyId = filter.companyId;
    customer.urId = await (0, stock_universal_server_1.generateUrId)(customer_model_1.customerMain);
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, customer_model_1.customerMain.collection.collectionName, 'makeTrackEdit');
    }
    return next();
};
exports.addCustomer = addCustomer;
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
const updateCustomer = async (req, res) => {
    const updatedCustomer = req.body.customer;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedCustomer.companyId = filter.companyId;
    const customer = await customer_model_1.customerMain
        .findOne({ _id: updatedCustomer._id, ...filter })
        .lean();
    if (!customer) {
        return res.status(404).send({ success: false });
    }
    let errResponse;
    const updated = await customer_model_1.customerMain.updateOne({
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
    (0, stock_universal_server_1.addParentToLocals)(res, customer._id, customer_model_1.customerMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
};
exports.updateCustomer = updateCustomer;
/**
 * Router for handling customer-related routes.
 */
exports.customerRoutes = express_1.default.Router();
exports.customerRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('customer'), (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_auth_server_1.addUser, exports.addCustomer, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('customer'));
exports.customerRoutes.post('/add/img', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('customer'), (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_auth_server_1.addUser, exports.addCustomer, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('customer'));
exports.customerRoutes.post('/one', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'read'), async (req, res) => {
    const { _id, userId } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    let filter2 = {};
    if (_id) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, _id };
    }
    /* if (companyId) {
    filter = { ...filter, ...filter };
  } */
    if (userId) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, user: userId };
    }
    const customer = await customer_model_1.customerLean
        .findOne({ ...filter2, ...filter })
        .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    if (!customer) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, customer._id, customer_model_1.customerMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(customer);
});
exports.customerRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        customer_model_1.customerLean
            .find({ ...filter })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        customer_model_1.customerLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, customer_model_1.customerMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.customerRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = customer_model_1.customerLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldUserFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), propSort, offset, limit)
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, customer_model_1.customerMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.customerRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'update'), stock_auth_server_1.updateUserBulk, exports.updateCustomer);
exports.customerRoutes.post('/update/img', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'update'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_auth_server_1.updateUserBulk, exports.updateCustomer);
exports.customerRoutes.put('/delete/one', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'delete'), (0, stock_auth_server_1.determineUserToRemove)(customer_model_1.customerLean, [{
        model: invoicerelated_model_1.invoiceRelatedLean,
        field: 'billingUserId',
        errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
    }]), stock_auth_server_1.removeOneUser, async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // const deleted = await customerMain.findOneAndDelete({ _id, ...filter });
    const deleted = await customer_model_1.customerMain
        .updateOne({ _id, ...filter }, { $set: { isDeleted: true } }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, customer_model_1.customerMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.customerRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'delete'), (0, stock_auth_server_1.determineUsersToRemove)(customer_model_1.customerLean, [{
        model: invoicerelated_model_1.invoiceRelatedLean,
        field: 'billingUserId',
        errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
    }]), stock_auth_server_1.removeManyUsers, async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await customerMain
    .deleteMany({ ...filter, _id: { $in: _ids } })
    .catch(err => {
      customerRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await customer_model_1.customerMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        customerRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, customer_model_1.customerMain.collection.collectionName, 'trackDataDelete');
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