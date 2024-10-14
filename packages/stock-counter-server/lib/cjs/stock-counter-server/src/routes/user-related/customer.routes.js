"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutes = exports.updateCustomer = exports.addCustomer = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const customer_model_1 = require("../../models/user-related/customer.model");
const query_1 = require("../../utils/query");
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
    if (!req.user || !req.body.user || !req.body.customer || !req.body.user._id) {
        return res.status(401).send({ success: false, err: 'unauthorised' });
    }
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { customer, user } = req.body;
    if (user._id) {
        customer.user = user._id;
    }
    else {
        return res.status(401).send({ success: false, err: 'unauthorised' });
    }
    customer.companyId = filter.companyId;
    customer.urId = await (0, stock_universal_server_1.generateUrId)(customer_model_1.customerMain);
    const newCustomer = new customer_model_1.customerMain(customer);
    /**
     * Saves a new customer to the database.
     * @function
     * @memberof module:customerRoutes
     * @inner
     * @param {Customer} newCustomer - The new customer to be saved.
     * @returns {Promise} - Promise representing the saved customer
     */
    const savedRes = await newCustomer.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, customer_model_1.customerMain.collection.collectionName, 'makeTrackEdit');
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
    const updateRes = await customer_model_1.customerMain.updateOne({
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
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, customer._id, customer_model_1.customerMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
};
exports.updateCustomer = updateCustomer;
/**
 * Router for handling customer-related routes.
 */
exports.customerRoutes = express_1.default.Router();
exports.customerRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('customer'), (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_auth_server_1.addUser, exports.addCustomer, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('customer'));
exports.customerRoutes.post('/add/img', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('customer'), (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_auth_server_1.addUser, exports.addCustomer, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('customer'));
exports.customerRoutes.post('/one', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'read'), async (req, res) => {
    const { _id, userId, urId, companyId } = req.body;
    if (!_id && !userId && !urId) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    let filter2 = {};
    if (_id) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, _id };
    }
    if (userId) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, user: userId };
    }
    if (urId) {
        filter2 = { ...filter2, urId };
    }
    if (companyId) {
        filter2 = { ...filter2, companyId };
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
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = customer_model_1.customerLean
        .aggregate([
        ...(0, stock_universal_server_1.lookupSubFieldUserFilter)((0, stock_universal_server_1.constructFiltersFromBody)(req), offset, limit, propSort, returnEmptyArr)
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
    const updateRes = await customer_model_1.customerMain
        .updateOne({ _id, ...filter }, { $set: { isDeleted: true } }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, customer_model_1.customerMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.customerRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('customers', 'delete'), (0, stock_auth_server_1.determineUsersToRemove)(customer_model_1.customerLean, [{
        model: invoicerelated_model_1.invoiceRelatedLean,
        field: 'billingUserId',
        errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
    }]), stock_auth_server_1.removeManyUsers, async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await customer_model_1.customerMain
        .updateMany({ ...filter, _id: { $in: _ids } }, {
        $set: { isDeleted: true }
    }).catch((err) => res);
    if (updateRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, customer_model_1.customerMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=customer.routes.js.map