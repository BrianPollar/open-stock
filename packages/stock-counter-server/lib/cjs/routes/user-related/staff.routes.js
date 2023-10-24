"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRoutes = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-misused-promises */
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const staff_model_1 = require("../../models/user-related/staff.model");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const locluser_routes_1 = require("./locluser.routes");
/** */
const staffRoutesLogger = (0, log4js_1.getLogger)('routes/staffRoutes');
/** */
exports.staffRoutes = express_1.default.Router();
exports.staffRoutes.post('/create', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users'), async (req, res) => {
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
    return res.status(200).send({ success: Boolean(saved) });
});
exports.staffRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const staff = await staff_model_1.staffLean
        .findById(id)
        .populate({ path: 'user', model: stock_auth_server_1.userLean })
        .lean();
    return res.status(200).send(staff);
});
exports.staffRoutes.get('/getall/:offset/:limit', async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const staffs = await staff_model_1.staffLean
        .find({})
        .populate({ path: 'user', model: stock_auth_server_1.userLean })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(staffs);
});
exports.staffRoutes.put('/update', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users'), async (req, res) => {
    const updatedCity = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(updatedCity._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const staff = await staff_model_1.staffMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(updatedCity._id);
    if (!staff) {
        return res.status(404).send({ success: false });
    }
    staff.startDate = updatedCity.startDate || staff.startDate;
    staff.endDate = updatedCity.endDate || staff.endDate;
    staff.occupation = updatedCity.occupation || staff.occupation;
    staff.employmentType = updatedCity.employmentType || staff.employmentType;
    staff.salary = updatedCity.salary || staff.salary;
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
exports.staffRoutes.put('/deleteone', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users'), locluser_routes_1.removeOneUser, stock_universal_server_1.deleteFiles, async (req, res) => {
    const { id } = req.body;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await staff_model_1.staffMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.staffRoutes.put('/deletemany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users'), locluser_routes_1.removeManyUsers, stock_universal_server_1.deleteFiles, async (req, res) => {
    const { ids } = req.body;
    console.log('givent whta we have ids', req.body);
    const isValid = (0, stock_universal_server_1.verifyObjectIds)(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await staff_model_1.staffMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } })
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