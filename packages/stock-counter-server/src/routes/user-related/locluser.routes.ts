import { user } from '@open-stock/stock-auth-server';
import { Icustomrequest } from '@open-stock/stock-universal';
import { deleteFiles, requireAuth, roleAuthorisation, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express, { NextFunction, Request, Response } from 'express';
import { getLogger } from 'log4js';
import { invoiceRelatedLean } from '../../models/printables/related/invoicerelated.model';
import { customerLean } from '../../models/user-related/customer.model';
import { staffLean } from '../../models/user-related/staff.model';
import { requireActiveCompany, requireCanUseFeature } from '../misc/company-auth';

interface IuserLinkedInMoreModels {
  success: boolean;
  msg: string;
}

/**
 * Removes one user from the database.
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction object.
 * @returns Promise<void>
 */
export const removeOneUser = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { credential } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(credential.userId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const canRemove = await canRemoveOneUser(credential.userId);
  if (!canRemove.success) {
    return res.status(401).send({ ...canRemove, status: 401 });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const deleted = await user.findOneAndDelete({ _id: credential.userId, companyId: queryId });
  req.body.id = credential.id;
  if (!Boolean(deleted)) {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
  next();
};

/**
 * Removes multiple users from the database.
 * @param req - Express Request object.
 * @param res - Express Response object.
 * @param next - Express NextFunction object.
 * @returns Promise<void>
 */
export const removeManyUsers = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { credentials } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds(credentials.map(val => val.userId));
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const promises = req.body.credentials.map(async(val) => {
    const canRemove = await canRemoveOneUser(val.userId);
    return Promise.resolve({ ...canRemove, ...val });
  });
  const all = await Promise.all(promises);
  const newIds = all.filter(val => val.success).map(val => val.id);
  const newUserIds = all.filter(val => val.success).map(val => val.userId);
  if (newIds.length <= 0) {
    return res.status(401).send({ success: false, status: 401, err: 'sorry all users selected are linked' });
  }
  const newFilesWithDir = req.body.filesWithDir.filter(val => newUserIds.includes(val.id));
  req.body.ids = newIds;
  req.body.newFilesWithDir = newFilesWithDir;
  const deleted = await user
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ companyId: queryId, _id: { $in: newUserIds } })
    .catch(err => {
      localUserRoutesLogger.error('deletemany - err: ', err);
      return null;
    });
  if (!Boolean(deleted)) {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
  next();
};

/**
 * Checks if a user can be removed from the database.
 * @param id - The ID of the user to check.
 * @returns Promise<IuserLinkedInMoreModels>
 */
export const canRemoveOneUser = async(id: string): Promise<IuserLinkedInMoreModels> => {
  const hasInvRelated = await invoiceRelatedLean.findOne({ billingUserId: id });
  if (hasInvRelated) {
    return {
      success: false,
      msg: 'user is linked to invoice, or estimate or delivery note or receipt'
    };
  }

  const hasCustomer = await customerLean.findOne({ user: id });
  if (hasCustomer) {
    return {
      success: false,
      msg: 'user is linked to customer'
    };
  }

  const hasStaff = await staffLean.findOne({ user: id });
  if (hasStaff) {
    return {
      success: false,
      msg: 'user is linked to customer'
    };
  }

  return {
    success: true,
    msg: 'user is not linked to anything'
  };
};

/** Logger for local user routes. */
const localUserRoutesLogger = getLogger('routes/customerRoutes');

/** Express Router for local user routes. */
export const localUserRoutes = express.Router();

localUserRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('feature'), roleAuthorisation('users', 'delete'), removeOneUser, deleteFiles, (req, res) => {
  return res.status(200).send({ success: true });
});

localUserRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, requireCanUseFeature('feature'), roleAuthorisation('users', 'delete'), removeManyUsers, deleteFiles, (req, res) => {
  return res.status(200).send({ success: true });
});
