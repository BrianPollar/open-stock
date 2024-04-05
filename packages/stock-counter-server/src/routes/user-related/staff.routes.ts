/* eslint-disable @typescript-eslint/no-misused-promises */
import { loginFactorRelgator, requireActiveCompany, requireCanUseFeature, requireUpdateSubscriptionRecord, userLean } from '@open-stock/stock-auth-server';
import { Icustomrequest, IdataArrayResponse, Isuccess } from '@open-stock/stock-universal';
import { deleteFiles, fileMetaLean, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { staffLean, staffMain } from '../../models/user-related/staff.model';
import { removeManyUsers, removeOneUser } from './locluser.routes';

const staffRoutesLogger = getLogger('routes/staffRoutes');

/**
 * Router for staff related routes.
 */
export const staffRoutes = express.Router();

staffRoutes.post('/create/:companyIdParam', requireAuth, requireCanUseFeature('report'), roleAuthorisation('users', 'create'), loginFactorRelgator, async(req, res, next) => {
  const staff = req.body.staff;
  const newStaff = new staffMain(staff);
  let errResponse: Isuccess;
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
      } else {
        errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
      }
      return errResponse;
    });

  if (errResponse) {
    return res.status(403).send(errResponse);
  }
  return next();
}, requireUpdateSubscriptionRecord);

staffRoutes.get('/getone/:id/:companyIdParam', async(req, res) => {
  const { id } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const staff = await staffLean
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOne({ _id: id, companyId: queryId })
    .populate({ path: 'user', model: userLean,
      populate: [{
        // eslint-disable-next-line @typescript-eslint/naming-convention
        path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
      }, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        path: 'profilePic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
      }, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        path: 'profileCoverPic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
      }] })
    .lean();
  return res.status(200).send(staff);
});


staffRoutes.get('/getall/:offset/:limit/:companyIdParam', async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const all = await Promise.all([
    staffLean
      .find({ companyId: queryId })
      .populate({ path: 'user', model: userLean,
        populate: [{
        // eslint-disable-next-line @typescript-eslint/naming-convention
          path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
          path: 'profilePic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
          path: 'profileCoverPic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }]
      })
      .skip(offset)
      .limit(limit)
      .lean(),
    staffLean.countDocuments({ companyId: queryId })
  ]);
  const response: IdataArrayResponse = {
    count: all[1],
    data: all[0]
  };
  return res.status(200).send(response);
});

staffRoutes.get('/getbyrole/:offset/:limit/:role/:companyIdParam', async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam, role } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const all = await Promise.all([
    staffLean
      .find({ companyId: queryId })
      .populate({ path: 'user', model: userLean, match: { role },
        populate: [{
        // eslint-disable-next-line @typescript-eslint/naming-convention
          path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
          path: 'profilePic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
          path: 'profileCoverPic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }] })
      .skip(offset)
      .limit(limit)
      .lean(),
    staffLean.countDocuments({ companyId: queryId })
  ]);
  const staffsToReturn = all[0].filter(val => val.user);
  const response: IdataArrayResponse = {
    count: all[1],
    data: staffsToReturn
  };
  return res.status(200).send(response);
});

staffRoutes.post('/search/:limit/:offset/:companyIdParam', async(req, res) => {
  const { searchterm, searchKey, extraDetails } = req.body;
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  let filters;

  switch (searchKey as string) {
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
      .find({ companyId: queryId, ...filters })
      .populate({ path: 'user', model: userLean, match: { ...matchFilter },
        populate: [{
        // eslint-disable-next-line @typescript-eslint/naming-convention
          path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
          path: 'profilePic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
          path: 'profileCoverPic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url })
        }] })
      .skip(offset)
      .limit(limit)
      .lean(),
    staffLean.countDocuments({ companyId: queryId, ...filters })
  ]);
  const staffsToReturn = all[0].filter(val => val.user);
  const response: IdataArrayResponse = {
    count: all[1],
    data: staffsToReturn
  };
  return res.status(200).send(response);
});

staffRoutes.put('/update/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'update'), async(req, res) => {
  const updatedStaff = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  updatedStaff.companyId = queryId;
  const isValid = verifyObjectId(updatedStaff._id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const staff = await staffMain
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
  let errResponse: Isuccess;
  const updated = await staff.save()
    .catch(err => {
      staffRoutesLogger.error('update - err: ', err);
      errResponse = {
        success: false,
        status: 403
      };
      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
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

staffRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), removeOneUser, deleteFiles, async(req, res) => {
  const { id } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([id, queryId]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await staffMain.findOneAndDelete({ _id: id, companyId: queryId });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

staffRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), removeManyUsers, deleteFiles, async(req, res) => {
  const { ids } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([...ids, ...[queryId]]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await staffMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids }, companyId: queryId })
    .catch(err => {
      staffRoutesLogger.error('deletemany - err: ', err);
      return null;
    });
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});


