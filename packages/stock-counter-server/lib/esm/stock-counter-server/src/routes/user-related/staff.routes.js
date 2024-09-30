import { addUser, determineUserToRemove, determineUsersToRemove, populateTrackEdit, populateTrackView, removeManyUsers, removeOneUser, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord, updateUserBulk } from '@open-stock/stock-auth-server';
import { addParentToLocals, appendBody, constructFiltersFromBody, generateUrId, lookupSubFieldUserFilter, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { invoiceRelatedLean } from '../../models/printables/related/invoicerelated.model';
import { staffLean, staffMain } from '../../models/user-related/staff.model';
import { populateUser } from '../../utils/query';
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
    const { staff, user } = req.body;
    staff.user = user._id;
    staff.companyId = filter.companyId;
    staff.urId = await generateUrId(staffMain);
    const newStaff = new staffMain(staff);
    let errResponse;
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
staffRoutes.post('/add', requireAuth, requireActiveCompany, requireCanUseFeature('staff'), roleAuthorisation('staffs', 'create'), addUser, addStaff, requireUpdateSubscriptionRecord('staff'));
staffRoutes.post('/add/img', requireAuth, requireActiveCompany, requireCanUseFeature('staff'), roleAuthorisation('staffs', 'create'), uploadFiles, appendBody, saveMetaToDb, addUser, addStaff, requireUpdateSubscriptionRecord('staff'));
staffRoutes.post('/one', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'read', true), async (req, res) => {
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
    if (req.body.profileOnly === 'true') {
        const { userId } = req.user;
        filter2 = { user: userId };
    }
    const staff = await staffLean
        .findOne({ ...filter2, ...filter })
        .populate([populateUser(), populateTrackEdit(), populateTrackView()])
        .lean();
    if (!staff) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, staff._id, staffMain.collection.collectionName, 'trackDataView');
    return res.status(200).send(staff);
});
staffRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'read'), async (req, res) => {
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
staffRoutes.get('/getbyrole/:offset/:limit/:role', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'read'), async (req, res) => {
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
staffRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const aggCursor = staffLean
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
        addParentToLocals(res, val._id, staffMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
staffRoutes.put('/update', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'update', true), updateUserBulk, updateStaff);
staffRoutes.post('/update/img', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'update', true), uploadFiles, appendBody, saveMetaToDb, updateUserBulk, updateStaff);
staffRoutes.put('/delete/one', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'delete'), determineUserToRemove(staffLean, [{
        model: invoiceRelatedLean,
        field: 'billingUserId',
        errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
    }]), removeOneUser, async (req, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    const deleted = await staffMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        addParentToLocals(res, _id, staffMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
staffRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('staffs', 'delete'), determineUsersToRemove(staffLean, [{
        model: invoiceRelatedLean,
        field: 'billingUserId',
        errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
    }]), removeManyUsers, async (req, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);
    /* const deleted = await staffMain
    .deleteMany({ _id: { $in: _ids }, ...filter })
    .catch(err => {
      staffRoutesLogger.error('deletemany - err: ', err);

      return null;
    }); */
    const deleted = await staffMain
        .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        staffRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of _ids) {
            addParentToLocals(res, val, staffMain.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
});
//# sourceMappingURL=staff.routes.js.map