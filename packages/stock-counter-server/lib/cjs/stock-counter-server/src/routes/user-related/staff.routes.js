"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRoutes = exports.updateStaff = exports.addStaff = void 0;
const tslib_1 = require("tslib");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const staff_model_1 = require("../../models/user-related/staff.model");
const query_1 = require("../../utils/query");
const locluser_routes_1 = require("./locluser.routes");
const staffRoutesLogger = tracer.colorConsole({
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
   * Adds a new staff member to the database.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next function.
   * @returns {Promise<void>} - A promise that resolves when the middleware has finished.
   */
const addStaff = async (req, res, next) => {
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const staff = req.body.staff;
    const savedUser = req.body.savedUser;
    staff.user = savedUser._id;
    staff.companyId = filter.companyId;
    const count = await staff_model_1.staffMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    staff.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newStaff = new staff_model_1.staffMain(staff);
    let errResponse;
    /**
     * Saves a new staff member to the database.
     * @param {Staff} newStaff - The new staff member to be saved.
     * @returns {Promise<Staff | ErrorResponse>} - A promise that resolves with the saved staff member or an error response.
     */
    const saved = await newStaff.save()
        .catch(err => {
        staffRoutesLogger.error('create - err: ', err);
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
        (0, stock_universal_server_1.addParentToLocals)(res, saved._id, staff_model_1.staffMain.collection.collectionName, 'makeTrackEdit');
    }
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
    const updatedStaff = req.body.staff;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    updatedStaff.companyId = filter.companyId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
    let errResponse;
    const updated = await staff_model_1.staffMain.updateOne({ ...filter2, ...filter }, { $set: {
            startDate: updatedStaff.startDate || staff.startDate,
            endDate: updatedStaff.endDate || staff.endDate,
            occupation: updatedStaff.occupation || staff.occupation,
            employmentType: updatedStaff.employmentType || staff.employmentType,
            salary: updatedStaff.salary || staff.salary,
            isDeleted: updatedStaff.isDeleted || staff.isDeleted
        } })
        .catch(err => {
        staffRoutesLogger.error('update - err: ', err);
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
    (0, stock_universal_server_1.addParentToLocals)(res, staff._id, staff_model_1.staffMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
};
exports.updateStaff = updateStaff;
/**
 * Router for staff related routes.
 */
exports.staffRoutes = express_1.default.Router();
exports.staffRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('staff'), (0, stock_universal_server_1.roleAuthorisation)('staffs', 'create'), stock_auth_server_1.addUser, exports.addStaff, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('staff'));
exports.staffRoutes.post('/createimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_auth_server_1.requireCanUseFeature)('staff'), (0, stock_universal_server_1.roleAuthorisation)('staffs', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_auth_server_1.addUser, exports.addStaff, (0, stock_auth_server_1.requireUpdateSubscriptionRecord)('staff'));
exports.staffRoutes.post('/getone/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'read', true), async (req, res) => {
    const { id, userId } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    let filter2 = {};
    if (id) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([id]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, _id: id };
    }
    /* if (queryId) {
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
    const staff = await staff_model_1.staffLean
        .findOne({ ...filter2, ...filter })
        .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    if (staff) {
        (0, stock_universal_server_1.addParentToLocals)(res, staff._id, staff_model_1.staffMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(staff);
});
exports.staffRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'read'), async (req, res) => {
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
exports.staffRoutes.get('/getbyrole/:offset/:limit/:role/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'read'), async (req, res) => {
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
exports.staffRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'read'), async (req, res) => {
    const { searchterm, searchKey, extraDetails } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    let filters;
    switch (searchKey) {
        case 'startDate':
        case 'endDate':
        case 'occupation':
        case 'employmentType':
        case 'salary':
            filters = { [searchKey]: { $regex: searchterm, $options: 'i' } };
            break;
        default:
            filters = {};
            break;
    }
    let matchFilter;
    if (!extraDetails) {
        matchFilter = {};
    }
    const all = await Promise.all([
        staff_model_1.staffLean
            .find({ ...filter, ...filters })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        staff_model_1.staffLean.countDocuments({ ...filter, ...filters })
    ]);
    const staffsToReturn = all[0].filter(val => val.user);
    const response = {
        count: all[1],
        data: staffsToReturn
    };
    return res.status(200).send(response);
});
exports.staffRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'update', true), stock_auth_server_1.updateUserBulk, exports.updateStaff);
exports.staffRoutes.post('/updateimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'update', true), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, stock_auth_server_1.updateUserBulk, exports.updateStaff);
exports.staffRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'delete'), (0, locluser_routes_1.removeOneUser)('staff'), async (req, res) => {
    const { id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await staff_model_1.staffMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, id, staff_model_1.staffMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.staffRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'delete'), (0, locluser_routes_1.removeManyUsers)('staff'), async (req, res) => {
    const { ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await staffMain
      .deleteMany({ _id: { $in: ids }, ...filter })
      .catch(err => {
        staffRoutesLogger.error('deletemany - err: ', err);
  
        return null;
      }); */
    const deleted = await staff_model_1.staffMain
        .updateMany({ _id: { $in: ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        staffRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of ids) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, staff_model_1.staffMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=staff.routes.js.map