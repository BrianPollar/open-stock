import { populatePhotos, populateProfileCoverPic, populateProfilePic, populateTrackEdit, populateTrackView, requireActiveCompany, user } from '@open-stock/stock-auth-server';
import { Icustomrequest, IfileMeta } from '@open-stock/stock-universal';
import { deleteAllFiles, requireAuth, roleAuthorisation, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { invoiceRelatedLean } from '../../models/printables/related/invoicerelated.model';
import { customerLean } from '../../models/user-related/customer.model';
import { staffLean } from '../../models/user-related/staff.model';

/** Logger for local user routes. */
const localUserRoutesLogger = tracer.colorConsole({
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

  interface IuserLinkedInMoreModels {
    success: boolean;
    msg: string;
  }

  type TcanByPass = 'customer' | 'staff' | 'none' | 'all';

/**
   * Removes one user from the database.
   * @param req - Express Request object.
   * @param res - Express Response object.
   * @param next - Express NextFunction object.
   * @returns Promise<void>
   */
export const removeOneUser = (canByPass: TcanByPass) => {
  return async(req, res, next): Promise<void> => {
    const { credential } = req.body;
    const { companyId } = (req as Icustomrequest).user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([credential.userId, queryId]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const canRemove = await canRemoveOneUser(credential.userId, canByPass);

    if (!canRemove.success) {
      return res.status(401).send({ ...canRemove, status: 401 });
    }

    /* const found = await user.findOne({ _id: credential.userId })
      .populate([populateProfilePic(true), populateProfileCoverPic(true), populatePhotos(true), populateTrackEdit(), populateTrackView() ])
      .lean(); */

    const found = await user.findOne({ _id: credential.userId })
      .populate([populateProfilePic(true), populateProfileCoverPic(true), populatePhotos(true), populateTrackEdit(), populateTrackView() ])
      .lean();

    if (found) {
      const filesWithDir = found.photos.map(photo => (
        {
          _id: photo._id,
          url: photo.url
        }
      ));

      await deleteAllFiles(filesWithDir);
    }

    /* const deleted = await user.findOneAndDelete({ _id: credential.userId, companyId: queryId }); */

    // !!
    const deleted = await user.updateOne({ _id: credential.userId, companyId: queryId }, {
      $set: { isDeleted: true }
    });

    req.body.id = credential.id;
    if (!Boolean(deleted)) {
      return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
    next();
  };
};

/**
   * Removes multiple users from the database.
   * @param req - Express Request object.
   * @param res - Express Response object.
   * @param next - Express NextFunction object.
   * @returns Promise<void>
   */
export const removeManyUsers = (canByPass: TcanByPass) => {
  return async(req, res, next): Promise<void> => {
    const { credentials } = req.body;
    const { companyId } = (req as Icustomrequest).user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...credentials.map(val => val.userId), ...[queryId]]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const promises = req.body.credentials.map(async(val) => {
      const canRemove = await canRemoveOneUser(val.userId, canByPass);

      return Promise.resolve({ ...canRemove, ...val });
    });
    const all = await Promise.all(promises);
    const newIds = all.filter(val => val.success).map(val => val.id);
    const newUserIds = all.filter(val => val.success).map(val => val.userId);

    if (newIds.length <= 0) {
      return res.status(401).send({ success: false, status: 401, err: 'sorry all users selected are linked' });
    }

    const newPhotosWithDir = req.body.filesWithDir.filter(val => newUserIds.includes(val.id));

    req.body.ids = newIds;
    req.body.newPhotosWithDir = newPhotosWithDir;
    let filesWithDir: IfileMeta[];
    const alltoDelete = await user.find({ companyId: queryId, _id: { $in: newUserIds } })
      .populate([populateProfilePic(true), populateProfileCoverPic(true), populatePhotos(true), populateTrackEdit(), populateTrackView() ])
      .lean();

    for (const user of alltoDelete) {
      if (user.photos?.length > 0) {
        filesWithDir = [...filesWithDir, ...user.photos as IfileMeta[]];
      }
    }

    await deleteAllFiles(filesWithDir);

    /* const deleted = await user
      .deleteMany({ companyId: queryId, _id: { $in: newUserIds } })
      .catch(err => {
        localUserRoutesLogger.error('deletemany - err: ', err);

        return null;
      }); */

    const deleted = await user
      .updateMany({ companyId: queryId, _id: { $in: newUserIds } }, {
        $set: { isDeleted: true }
      })
      .catch(err => {
        localUserRoutesLogger.error('deletemany - err: ', err);

        return null;
      });


    if (!Boolean(deleted)) {
      return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
    next();
  };
};

/**
   * Checks if a user can be removed from the database.
   * @param id - The ID of the user to check.
   * @returns Promise<IuserLinkedInMoreModels>
   */
export const canRemoveOneUser = async(id: string, byPass: TcanByPass): Promise<IuserLinkedInMoreModels> => {
  const hasInvRelated = await invoiceRelatedLean.findOne({ billingUserId: id });

  if (hasInvRelated) {
    return {
      success: false,
      msg: 'user is linked to invoice, or estimate or delivery note or receipt'
    };
  }

  if (byPass === 'all') {
    return {
      success: false,
      msg: 'respecting bypass all and only checked if user has invoice, now moving on'
    };
  }

  if (byPass !== 'customer') {
    const hasCustomer = await customerLean.findOne({ user: id });

    if (hasCustomer) {
      return {
        success: false,
        msg: 'user is linked to customer' // or user is a customer
      };
    }
  }

  if (byPass !== 'customer' && byPass !== 'staff') {
    const hasStaff = await staffLean.findOne({ user: id });

    if (hasStaff) {
      return {
        success: false,
        msg: 'user is linked to customer'
      };
    }
  }

  return {
    success: true,
    msg: 'user is not linked to anything'
  };
};

/** Express Router for local user routes. */
export const localUserRoutes = express.Router();

localUserRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), removeOneUser('none'), (req, res) => {
  return res.status(200).send({ success: true });
});

localUserRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), removeManyUsers('none'), (req, res) => {
  return res.status(200).send({ success: true });
});
