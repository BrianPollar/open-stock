/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getLogger } from 'log4js';
import { deleteFiles, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { staffLean, staffMain } from '../../models/user-related/staff.model';
import { userLean } from '@open-stock/stock-auth-server';
import { removeManyUsers, removeOneUser } from './locluser.routes';
/** */
const staffRoutesLogger = getLogger('routes/staffRoutes');
/** */
export const staffRoutes = express.Router();
staffRoutes.post('/create', requireAuth, roleAuthorisation('users'), async (req, res) => {
    const staff = req.body.staff;
    const newStaff = new staffMain(staff);
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
staffRoutes.get('/getone/:id', async (req, res) => {
    const { id } = req.params;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const staff = await staffLean
        .findById(id)
        .populate({ path: 'user', model: userLean })
        .lean();
    return res.status(200).send(staff);
});
staffRoutes.get('/getall/:offset/:limit', async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const staffs = await staffLean
        .find({})
        .populate({ path: 'user', model: userLean })
        .skip(offset)
        .limit(limit)
        .lean();
    return res.status(200).send(staffs);
});
staffRoutes.put('/update', requireAuth, roleAuthorisation('users'), async (req, res) => {
    const updatedCity = req.body;
    const isValid = verifyObjectId(updatedCity._id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const staff = await staffMain
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
staffRoutes.put('/deleteone', requireAuth, roleAuthorisation('users'), removeOneUser, deleteFiles, async (req, res) => {
    const { id } = req.body;
    const isValid = verifyObjectId(id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await staffMain.findByIdAndDelete(id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
staffRoutes.put('/deletemany', requireAuth, roleAuthorisation('users'), removeManyUsers, deleteFiles, async (req, res) => {
    const { ids } = req.body;
    console.log('givent whta we have ids', req.body);
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await staffMain
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