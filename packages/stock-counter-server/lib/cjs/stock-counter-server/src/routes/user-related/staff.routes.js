"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const staff_model_1 = require("../../models/user-related/staff.model");
const locluser_routes_1 = require("./locluser.routes");
const staffRoutesLogger = (0, log4js_1.getLogger)('routes/staffRoutes');
/**
 * Router for staff related routes.
 */
exports.staffRoutes = express_1.default.Router();
exports.staffRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_auth_server_1.requireCanUseFeature)('report'), (0, stock_universal_server_1.roleAuthorisation)('staffs', 'create'), stock_auth_server_1.loginFactorRelgator, async (req, res, next) => {
    const staff = req.body.staff;
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
        return errResponse;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    return next();
}, stock_auth_server_1.requireUpdateSubscriptionRecord);
exports.staffRoutes.get('/getone/:id/:companyIdParam', async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const staff = await staff_model_1.staffLean
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOne({ _id: id, companyId: queryId })
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
    return res.status(200).send(staff);
});
exports.staffRoutes.get('/getall/:offset/:limit/:companyIdParam', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        staff_model_1.staffLean
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
        staff_model_1.staffLean.countDocuments({ companyId: queryId })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.staffRoutes.get('/getbyrole/:offset/:limit/:role/:companyIdParam', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam, role } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const all = await Promise.all([
        staff_model_1.staffLean
            .find({ companyId: queryId })
            .populate({ path: 'user', model: stock_auth_server_1.userLean, match: { role },
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
            .skip(offset)
            .limit(limit)
            .lean(),
        staff_model_1.staffLean.countDocuments({ companyId: queryId })
    ]);
    const staffsToReturn = all[0].filter(val => val.user);
    const response = {
        count: all[1],
        data: staffsToReturn
    };
    return res.status(200).send(response);
});
exports.staffRoutes.post('/search/:limit/:offset/:companyIdParam', async (req, res) => {
    const { searchterm, searchKey, extraDetails } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
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
            .find({ companyId: queryId, ...filters })
            .populate({ path: 'user', model: stock_auth_server_1.userLean, match: { ...matchFilter },
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
            .skip(offset)
            .limit(limit)
            .lean(),
        staff_model_1.staffLean.countDocuments({ companyId: queryId, ...filters })
    ]);
    const staffsToReturn = all[0].filter(val => val.user);
    const response = {
        count: all[1],
        data: staffsToReturn
    };
    return res.status(200).send(response);
});
exports.staffRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'update'), async (req, res) => {
    const updatedStaff = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    updatedStaff.companyId = queryId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(updatedStaff._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const staff = await staff_model_1.staffMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id: updatedStaff._id, companyId: queryId });
    if (!staff) {
        return res.status(404).send({ success: false });
    }
    staff.startDate = updatedStaff.startDate || staff.startDate;
    staff.endDate = updatedStaff.endDate || staff.endDate;
    staff.occupation = updatedStaff.occupation || staff.occupation;
    staff.employmentType = updatedStaff.employmentType || staff.employmentType;
    staff.salary = updatedStaff.salary || staff.salary;
    let errResponse;
    const updated = await staff.save()
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
    return res.status(200).send({ success: Boolean(updated) });
});
exports.staffRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'delete'), locluser_routes_1.removeOneUser, stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await staff_model_1.staffMain.findOneAndDelete({ _id: id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.staffRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, stock_auth_server_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('staffs', 'delete'), locluser_routes_1.removeManyUsers, stock_universal_server_1.deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await staff_model_1.staffMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids }, companyId: queryId })
        .catch(err => {
        staffRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=staff.routes.js.map