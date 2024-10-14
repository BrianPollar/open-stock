"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRoutes = exports.updateStaff = exports.addStaff = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const invoicerelated_model_1 = require("../../models/printables/related/invoicerelated.model");
const staff_model_1 = require("../../models/user-related/staff.model");
const query_1 = require("../../utils/query");
/**
   * Adds a new staff member to the database.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next function.
   * @returns {Promise<void>} - A promise that resolves when the middleware has finished.
   */
const addStaff = async (req, res, next) => {
    if (!req.user || !req.body.user || !req.body.staff || !req.body.user._id) {
        return res.status(401).send({ success: false, err: 'unauthorised' });
    }
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { staff, user } = req.body;
    if (user._id) {
        staff.user = user._id;
    }
    else {
        return res.status(401).send({ success: false, err: 'unauthorised' });
    }
    staff.companyId = filter.companyId;
    staff.urId = await (0, stock_universal_server_1.generateUrId)(staff_model_1.staffMain);
    const newStaff = new staff_model_1.staffMain(staff);
    const savedRes = await newStaff.save()
        .catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, savedRes._id, staff_model_1.staffMain.collection.collectionName, 'makeTrackEdit');
    return next();
};
exports.addStaff = addStaff;
/**
   * Updates a staff member.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @returns {Promise<void>} - A promise that resolves when the middleware has finished.
   */
const updateStaff = async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, err: 'unauthorised' });
    }
    const updatedStaff = req.body.staff;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedStaff.companyId = filter.companyId;
    let filter2 = { _id: updatedStaff._id };
    if (req.body.profileOnly === 'true') {
        const { userId } = req.user;
        filter2 = { user: userId };
    }
    const staff = await staff_model_1.staffMain
        .findOne(filter).lean();
    if (!staff) {
        return res.status(404).send({ success: false });
    }
    const updateRes = await staff_model_1.staffMain.updateOne({ ...filter2, ...filter }, { $set: {
            startDate: updatedStaff.startDate || staff.startDate,
            endDate: updatedStaff.endDate || staff.endDate,
            occupation: updatedStaff.occupation || staff.occupation,
            employmentType: updatedStaff.employmentType || staff.employmentType,
            salary: updatedStaff.salary || staff.salary,
            isDeleted: updatedStaff.isDeleted || staff.isDeleted
        } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, staff._id, staff_model_1.staffMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: true });
};
exports.updateStaff = updateStaff;
/**
 * Router for staff related routes.
 */
exports.staffRoutes = express_1.default.Router();
exports.staffRoutes.post('/add', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('staff'), (0, stock_universal_server_1.roleAuthorisation)('staffs', 'create'), stock_auth_server_1.addUser, exports.addStaff, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('staff'));
exports.staffRoutes.post('/add/img', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('staff'), (0, stock_universal_server_1.roleAuthorisation)('staffs', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_auth_server_1.addUser, exports.addStaff, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('staff'));
exports.staffRoutes.post('/one', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'read', true), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
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
    if (req.body.profileOnly === 'true') {
        const { userId } = req.user;
        filter2 = { user: userId };
    }
    if (urId) {
        filter2 = { ...filter2, urId };
    }
    if (companyId) {
        filter2 = { ...filter2, companyId };
    }
    const staff = await staff_model_1.staffLean
        .findOne({ ...filter2, ...filter })
        .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    if (!staff) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    (0, stock_universal_server_1.addParentToLocals)(res, staff._id, staff_model_1.staffMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(staff);
});
exports.staffRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        staff_model_1.staffLean
            .find({ ...filter })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        staff_model_1.staffLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, staff_model_1.staffMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.staffRoutes.get('/getbyrole/:offset/:limit/:role', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'read'), async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        staff_model_1.staffLean
            .find({ ...filter })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        staff_model_1.staffLean.countDocuments({ ...filter })
    ]);
    const staffsToReturn = all[0].filter(val => val.user);
    const response = {
        count: all[1],
        data: staffsToReturn
    };
    for (const val of staffsToReturn) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, staff_model_1.staffMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.staffRoutes.post('/filter', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const aggCursor = staff_model_1.staffLean
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, staff_model_1.staffMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.staffRoutes.put('/update', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'update', true), stock_auth_server_1.updateUserBulk, exports.updateStaff);
exports.staffRoutes.post('/update/img', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'update', true), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_auth_server_1.updateUserBulk, exports.updateStaff);
exports.staffRoutes.put('/delete/one', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'delete'), (0, stock_auth_server_1.determineUserToRemove)(staff_model_1.staffLean, [{
        model: invoicerelated_model_1.invoiceRelatedLean,
        field: 'billingUserId',
        errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
    }]), stock_auth_server_1.removeOneUser, async (req, res) => {
    const { _id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await staff_model_1.staffMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    (0, stock_universal_server_1.addParentToLocals)(res, _id, staff_model_1.staffMain.collection.collectionName, 'trackDataDelete');
    return res.status(200).send({ success: true });
});
exports.staffRoutes.put('/delete/many', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'delete'), (0, stock_auth_server_1.determineUsersToRemove)(staff_model_1.staffLean, [{
        model: invoicerelated_model_1.invoiceRelatedLean,
        field: 'billingUserId',
        errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
    }]), stock_auth_server_1.removeManyUsers, async (req, res) => {
    const { _ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const updateRes = await staff_model_1.staffMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = (0, stock_universal_server_1.handleMongooseErr)(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    for (const val of _ids) {
        (0, stock_universal_server_1.addParentToLocals)(res, val, staff_model_1.staffMain.collection.collectionName, 'trackDataDelete');
    }
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=staff.routes.js.map