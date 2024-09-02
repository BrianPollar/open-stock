/* eslint-disable @typescript-eslint/no-misused-promises */
import { addUser, populateTrackEdit, populateTrackView, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord, updateUserBulk } from '@open-stock/stock-auth-server';
import { addParentToLocals, appendBody, makeCompanyBasedQuery, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { staffLean, staffMain } from '../../models/user-related/staff.model';
import { populateUser } from '../../utils/query';
import { removeManyUsers, removeOneUser } from './locluser.routes';
const staffRoutesLogger = tracer.colorConsole({
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
   * Adds a new staff member to the database.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next function.
   * @returns {Promise<void>} - A promise that resolves when the middleware has finished.
   */
export const addStaff = async (req, res, next) => {
    const { filter } = makeCompanyBasedQuery(req);
    const staff = req.body.staff;
    const savedUser = req.body.savedUser;
    staff.user = savedUser._id;
    staff.companyId = filter.companyId;
    const count = await staffMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    staff.urId = makeUrId(Number(count[0]?.urId || '0'));
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
        return err;
    });
    if (errResponse) {
        return res.status(403).send(errResponse);
    }
    if (saved && saved._id) {
        addParentToLocals(res, saved._id, staffMain.collection.collectionName, 'makeTrackEdit');
    }
    return next();
};
/**
   * Updates a staff member.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @returns {Promise<void>} - A promise that resolves when the middleware has finished.
   */
export const updateStaff = async (req, res) => {
    const updatedStaff = req.body.staff;
    const { filter } = makeCompanyBasedQuery(req);
    updatedStaff.companyId = filter.companyId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let filter2 = { _id: updatedStaff._id };
    if (req.body.profileOnly === 'true') {
        const { userId } = req.user;
        filter2 = { user: userId };
    }
    const staff = await staffMain
        .findOne(filter).lean();
    if (!staff) {
        return res.status(404).send({ success: false });
    }
    let errResponse;
    const updated = await staffMain.updateOne({ ...filter2, ...filter }, { $set: {
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
    addParentToLocals(res, staff._id, staffMain.collection.collectionName, 'makeTrackEdit');
    return res.status(200).send({ success: Boolean(updated) });
};
/**
 * Router for staff related routes.
 */
export const staffRoutes = express.Router();
staffRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('staff'), roleAuthorisation('staffs', 'create'), addUser, addStaff, requireUpdateSubscriptionRecord('staff'));
staffRoutes.post('/createimg/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('staff'), roleAuthorisation('staffs', 'create'), uploadFiles, appendBody, saveMetaToDb, addUser, addStaff, requireUpdateSubscriptionRecord('staff'));
staffRoutes.post('/getone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'read', true), async (req, res) => {
    const { id, userId } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    let filter2 = {};
    if (id) {
        const isValid = verifyObjectIds([id]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, _id: id };
    }
    /* if (queryId) {
      filter = { ...filter, ...filter };
    } */
    if (userId) {
        const isValid = verifyObjectIds([userId]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, user: userId };
    }
    if (req.body.profileOnly === 'true') {
        const { userId } = req.user;
        filter2 = { user: userId };
    }
    const staff = await staffLean
        .findOne({ ...filter2, ...filter })
        .populate([populateUser(), populateTrackEdit(), populateTrackView()])
        .lean();
    if (staff) {
        addParentToLocals(res, staff._id, staffMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(staff);
});
staffRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        staffLean
            .find({ ...filter })
            .populate([populateUser(), populateTrackEdit(), populateTrackView()])
            .skip(offset)
            .limit(limit)
            .lean(),
        staffLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, staffMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
staffRoutes.get('/getbyrole/:offset/:limit/:role/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'read'), async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
        staffLean
            .find({ ...filter })
            .populate([populateUser(), populateTrackEdit(), populateTrackView()])
            .skip(offset)
            .limit(limit)
            .lean(),
        staffLean.countDocuments({ ...filter })
    ]);
    const staffsToReturn = all[0].filter(val => val.user);
    const response = {
        count: all[1],
        data: staffsToReturn
    };
    for (const val of staffsToReturn) {
        addParentToLocals(res, val._id, staffMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
staffRoutes.post('/search/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'read'), async (req, res) => {
    const { searchterm, searchKey, extraDetails } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
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
        staffLean
            .find({ ...filter, ...filters })
            .populate([populateUser(), populateTrackEdit(), populateTrackView()])
            .skip(offset)
            .limit(limit)
            .lean(),
        staffLean.countDocuments({ ...filter, ...filters })
    ]);
    const staffsToReturn = all[0].filter(val => val.user);
    const response = {
        count: all[1],
        data: staffsToReturn
    };
    return res.status(200).send(response);
});
staffRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'update', true), updateUserBulk, updateStaff);
staffRoutes.post('/updateimg/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'update', true), uploadFiles, appendBody, saveMetaToDb, updateUserBulk, updateStaff);
staffRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'delete'), removeOneUser('staff'), async (req, res) => {
    const { id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const deleted = await staffMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        addParentToLocals(res, id, staffMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
staffRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'delete'), removeManyUsers('staff'), async (req, res) => {
    const { ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    /* const deleted = await staffMain
      .deleteMany({ _id: { $in: ids }, ...filter })
      .catch(err => {
        staffRoutesLogger.error('deletemany - err: ', err);
  
        return null;
      }); */
    const deleted = await staffMain
        .updateMany({ _id: { $in: ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        staffRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of ids) {
            addParentToLocals(res, val, staffMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=staff.routes.js.map