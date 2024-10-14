
import {
  addUser, determineUserToRemove, determineUsersToRemove, populateTrackEdit, populateTrackView,
  removeManyUsers,
  removeOneUser,
  requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord, updateUserBulk
} from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IdeleteMany,
  IeditStaff,
  IfilterAggResponse, IfilterProps
} from '@open-stock/stock-universal';
import {
  addParentToLocals,
  appendBody, constructFiltersFromBody,
  generateUrId,
  handleMongooseErr,
  lookupSubFieldUserFilter, makeCompanyBasedQuery, offsetLimitRelegator,
  requireAuth,
  roleAuthorisation, saveMetaToDb, uploadFiles, verifyObjectIds
} from '@open-stock/stock-universal-server';
import express, { NextFunction, Response } from 'express';
import { invoiceRelatedLean } from '../../models/printables/related/invoicerelated.model';
import { Tstaff, staffLean, staffMain } from '../../models/user-related/staff.model';
import { populateUser } from '../../utils/query';

/**
   * Adds a new staff member to the database.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next function.
   * @returns {Promise<void>} - A promise that resolves when the middleware has finished.
   */
export const addStaff = async(
  req: IcustomRequest<never, Partial<IeditStaff>>,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.body.user || !req.body.staff || !req.body.user._id) {
    return res.status(401).send({ success: false, err: 'unauthorised' });
  }
  const { filter } = makeCompanyBasedQuery(req);
  const { staff, user } = req.body;

  if (user._id) {
    staff.user = user._id;
  } else {
    return res.status(401).send({ success: false, err: 'unauthorised' });
  }

  staff.companyId = filter.companyId;

  staff.urId = await generateUrId(staffMain);

  const newStaff = new staffMain(staff);


  const savedRes = await newStaff.save()
    .catch((err: Error) => err);

  if (savedRes instanceof Error) {
    const errResponse = handleMongooseErr(savedRes);

    return res.status(errResponse.status).send(errResponse);
  }

  addParentToLocals(res, savedRes._id, staffMain.collection.collectionName, 'makeTrackEdit');

  return next();
};

/**
   * Updates a staff member.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @returns {Promise<void>} - A promise that resolves when the middleware has finished.
   */
export const updateStaff = async(req: IcustomRequest<never, IeditStaff & { profileOnly?: string }>, res) => {
  if (!req.user) {
    return res.status(401).send({ success: false, err: 'unauthorised' });
  }
  const updatedStaff = req.body.staff;
  const { filter } = makeCompanyBasedQuery(req);

  updatedStaff.companyId = filter.companyId;

  let filter2 = { _id: updatedStaff._id } as object;

  if (req.body.profileOnly === 'true') {
    const { userId } = req.user;

    filter2 = { user: userId };
  }
  const staff = await staffMain
    .findOne(filter).lean();

  if (!staff) {
    return res.status(404).send({ success: false });
  }

  const updateRes = await staffMain.updateOne({ ...filter2, ...filter }, { $set: {
    startDate: updatedStaff.startDate || staff.startDate,
    endDate: updatedStaff.endDate || staff.endDate,
    occupation: updatedStaff.occupation || staff.occupation,
    employmentType: updatedStaff.employmentType || staff.employmentType,
    salary: updatedStaff.salary || staff.salary,
    isDeleted: updatedStaff.isDeleted || staff.isDeleted
  } })
    .catch((err: Error) => err);

  if (updateRes instanceof Error) {
    const errResponse = handleMongooseErr(updateRes);

    return res.status(errResponse.status).send(errResponse);
  }

  addParentToLocals(res, staff._id, staffMain.collection.collectionName, 'makeTrackEdit');

  return res.status(200).send({ success: true });
};

/**
 * Router for staff related routes.
 */
export const staffRoutes = express.Router();

staffRoutes.post(
  '/add',
  requireAuth,
  requireActiveCompany,
  requireCanUseFeature('staff'),
  roleAuthorisation('staffs', 'create'),
  addUser,
  addStaff,
  requireUpdateSubscriptionRecord('staff')
);

staffRoutes.post(
  '/add/img',
  requireAuth,
  requireActiveCompany,
  requireCanUseFeature('staff'),
  roleAuthorisation('staffs', 'create'),
  uploadFiles,
  appendBody,
  saveMetaToDb,
  addUser,
  addStaff,
  requireUpdateSubscriptionRecord('staff')
);

staffRoutes.post(
  '/one',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('staffs', 'read', true),
  async(req: IcustomRequest<never, {
    _id?: string; userId?: string; urId: string; companyId?: string; profileOnly?: string; }>, res) => {
    if (!req.user) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { _id, userId, urId, companyId } = req.body;

    if (!_id && !userId && !urId) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
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

    if (urId) {
      filter2 = { ...filter2, urId };
    }

    if (companyId) {
      filter2 = { ...filter2, companyId };
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
  }
);

staffRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('staffs', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
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
    const response: IdataArrayResponse<Tstaff> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, staffMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

staffRoutes.get(
  '/getbyrole/:offset/:limit/:role',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('staffs', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
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
    const response: IdataArrayResponse<Tstaff> = {
      count: all[1],
      data: staffsToReturn
    };

    for (const val of staffsToReturn) {
      addParentToLocals(res, val._id, staffMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

staffRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('staffs', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const aggCursor = staffLean
      .aggregate<IfilterAggResponse<Tstaff>>([
        ...lookupSubFieldUserFilter(constructFiltersFromBody(req), offset, limit, propSort, returnEmptyArr)
      ]);
    const dataArr: IfilterAggResponse<Tstaff>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const staffsToReturn = all.filter(val => val.user);
    const response: IdataArrayResponse<Tstaff> = {
      count,
      data: staffsToReturn
    };

    for (const val of staffsToReturn) {
      addParentToLocals(res, val._id, staffMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

staffRoutes.put(
  '/update',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('staffs', 'update', true),
  updateUserBulk,
  updateStaff
);

staffRoutes.post(
  '/update/img',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('staffs', 'update', true),
  uploadFiles,
  appendBody,
  saveMetaToDb,
  updateUserBulk,
  updateStaff
);

staffRoutes.put(
  '/delete/one',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('staffs', 'delete'),
  determineUserToRemove(staffLean, [{
    model: invoiceRelatedLean,
    field: 'billingUserId',
    errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
  }]),
  removeOneUser,
  async(req: IcustomRequest<never, { _id: string }>, res) => {
    const { _id } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const updateRes = await staffMain.updateOne({ _id, ...filter }, { $set: { isDeleted: true } })
      .catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    addParentToLocals(res, _id, staffMain.collection.collectionName, 'trackDataDelete');

    return res.status(200).send({ success: true });
  }
);

staffRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('staffs', 'delete'),
  determineUsersToRemove(staffLean, [{
    model: invoiceRelatedLean,
    field: 'billingUserId',
    errMsg: 'user has an invoice an could not be removed, consider removing invoice first'
  }]),
  removeManyUsers,
  async(req: IcustomRequest<never, IdeleteMany>, res) => {
    const { _ids } = req.body;
    const { filter } = makeCompanyBasedQuery(req);

    const updateRes = await staffMain
      .updateMany({ _id: { $in: _ids }, ...filter }, {
        $set: { isDeleted: true }
      }).catch((err: Error) => err);

    if (updateRes instanceof Error) {
      const errResponse = handleMongooseErr(updateRes);

      return res.status(errResponse.status).send(errResponse);
    }

    for (const val of _ids) {
      addParentToLocals(res, val, staffMain.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: true });
  }
);


