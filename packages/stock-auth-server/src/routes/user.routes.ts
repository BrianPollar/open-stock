import {
  Iauthresponse, Icompany, IcustomRequest, IcustomRequestSocial, IdataArrayResponse, IdeleteMany, IdeleteOne,
  IfileMeta, IfilterAggResponse, IfilterProps, Isuccess, Iuser, Iuserperm,
  TuserType,
  makeRandomString,
  subscriptionPackages
} from '@open-stock/stock-universal';
import {
  addParentToLocals,
  appendBody,
  constructFiltersFromBody,
  deleteAllFiles,
  deleteFiles,
  fileMetaLean,
  generateUrId,
  lookupLimit,
  lookupOffset,
  lookupSort,
  lookupTrackEdit,
  lookupTrackView,
  makeCompanyBasedQuery,
  offsetLimitRelegator,
  requireAuth,
  roleAuthorisation,
  saveMetaToDb,
  stringifyMongooseErr, uploadFiles,
  verifyObjectId,
  verifyObjectIds
} from '@open-stock/stock-universal-server';
import express, { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import mongoose, { Model } from 'mongoose';
import path from 'path';
import * as tracer from 'tracer';
import { companyLean, companyMain } from '../models/company.model';
import { companySubscriptionMain } from '../models/subscriptions/company-subscription.model';
import { Tuser, user, userAuthSelect, userLean } from '../models/user.model';
import { stockAuthConfig } from '../stock-auth-local';
import {
  checkIpAndAttempt,
  confirmAccountFactory,
  determineIfIsPhoneAndMakeFilterObj,
  isInAdictionaryOnline,
  isTooCommonPhrase,
  recoverAccountFactory,
  resetAccountFactory
} from '../utils/auth';
import {
  populatePhotos, populateProfileCoverPic, populateProfilePic, populateTrackEdit, populateTrackView
} from '../utils/query';
import { makeUserReturnObject, sendTokenEmail, sendTokenPhone } from '../utils/universial';
import { requireActiveCompany } from './company-auth';
import { getDays } from './subscriptions/company-subscription.routes';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
const passport = require('passport');

/**
 * Router for authentication routes.
 */
export const userAuthRoutes = express.Router();

/**
 * Logger for authentication routes.
 */
const authLogger = tracer.colorConsole({
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
    fs.appendFile(logDir + '/auth-server.log', data.rawoutput + '\n', err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('raw.output err ', err);
      }
    });
  }
});

interface ImodelsCred {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  field: string;
  errMsg: string;
}

interface IuserLinkedInMoreModels {
  success: boolean;
  msg: string;
}

export const determineUserToRemove = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  linkedModels: ImodelsCred[]
) => {
  return async(req: IcustomRequest<never, { _id: string; userId: string}>, res: Response, next: NextFunction) => {
    const { _id } = req.body;
    const isValid = verifyObjectId(_id);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }

    const found = await model.findOne({ _id });

    if (!found || !found.user) {
      return res.status(404).send({ msg: 'User not found', status: 404 });
    }

    const canRemove = await canRemoveOneUser(found.user, linkedModels);

    if (!canRemove.success) {
      return res.status(401).send({ ...canRemove, status: 401 });
    }

    req.body.userId = found.user ;
    next();
  };
};

export const determineUsersToRemove = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  linkedModels: ImodelsCred[]
) => {
  return async(req: IcustomRequest<never, { _ids: string[]; userIds: string[]}>, res, next): Promise<void> => {
    const { _ids } = req.body;
    const isValid = verifyObjectIds(_ids);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }

    const manay = await model.find({ _id: { $in: _ids } });

    const promises = manay.map(async(val) => {
      const canRemove = await canRemoveOneUser(val.user, linkedModels);

      return Promise.resolve({ ...canRemove, ...val });
    });
    const all = await Promise.all(promises);
    const newIds = all.filter(val => val.success && val.user).map(val => val._id.toString());
    const newUserIds = all.filter(val => val.success).map(val => val.user);

    if (newIds.length <= 0) {
      return res.status(401).send({ success: false, status: 401, err: 'sorry all users selected are linked' });
    }

    req.body._ids = newIds;
    req.body.userIds = newUserIds;

    next();
  };
};

export const canRemoveOneUser = async(
  id: string | mongoose.Types.ObjectId,
  modelsCred: ImodelsCred[]
): Promise<IuserLinkedInMoreModels> => {
  const promises = modelsCred.map(async val => {
    const found = await val.model.findOne({ [val.field]: id });
    let toReturnMsg: string;

    if (found) {
      toReturnMsg = val.errMsg;
    } else {
      toReturnMsg = null;
    }

    return new Promise(resolve => resolve(toReturnMsg));
  });

  const all = await Promise.all(promises);

  for (const val of all) {
    if (val) {
      return {
        success: false,
        msg: val as string
      };
    }
  }

  return {
    success: true,
    msg: 'user is not linked to anything'
  };
};

export const signupFactorRelgator = async(
  req: IcustomRequest<never, {
    emailPhone: string; passwd: string; firstName: string; lastName: string; userType: TuserType; foundUser?: Iuser;}>,
  res: Response,
  next: NextFunction
) => {
  authLogger.info('signupFactorRelgator');
  const { emailPhone } = req.body;
  const userType: TuserType = req.body.userType || 'eUser';
  const passwd = req.body.passwd;
  let phone;
  let email;
  let query;
  let isPhone: boolean;

  authLogger.debug(`signup, 
    emailPhone: ${emailPhone}`);

  if (isNaN(Number(emailPhone))) {
    query = {
      email: emailPhone
    };
    isPhone = false;
    email = emailPhone;
  } else {
    query = {
      phone: emailPhone
    };
    isPhone = true;
    phone = emailPhone;
  }

  const foundUser = await user.findOne(query);

  /* if (userType === 'company') {
    foundUser = await companyMain.findOne(query);
  } else {
    foundUser = await user.findOne(query);
  } */

  if (foundUser) {
    if (!foundUser?.password || !foundUser?.verified) {
      req.body.foundUser = foundUser;

      return next();
    }

    const phoneOrEmail = isPhone ? 'phone' : 'email';
    const response: Iauthresponse = {
      success: false,
      err: phoneOrEmail +
        ', already exists, try using another'
    };

    return res.status(200).send(response);
  }


  let permissions: Iuserperm;
  const expireAt = Date.now();
  let company;
  let savedSub;

  if (userType === 'company') {
    const companyUrId = await generateUrId(companyMain);
    const name = 'company ' + makeRandomString(11, 'letters');

    permissions = {
      companyAdminAccess: true
    };
    const newCompany = new companyMain({
      urId: companyUrId,
      name,
      displayName: name,
      expireAt,
      countryCode: '+256'
    });
    let savedErr: string;

    company = await newCompany.save().catch(err => {
      authLogger.error('save error', err);
      savedErr = err;

      return err;
    });

    if (company && company._id) {
      addParentToLocals(res, company._id, user.collection.collectionName, 'makeTrackEdit');
    }

    if (savedErr) {
      return res.status(500).send({ success: false });
    }

    const freePkg = subscriptionPackages[3];
    const startDate = new Date();
    const now = new Date();
    const endDate = now.setDate(now.getDate() + getDays(freePkg.duration));
    const newSub = new companySubscriptionMain({
      companyId: company._id,
      name: freePkg.name,
      ammount: freePkg.ammount,
      duration: freePkg.duration,
      active: freePkg.active,
      startDate,
      endDate,
      status: 'paid',
      features: freePkg.features
    });

    savedSub = await newSub.save().catch(err => {
      authLogger.error('save error', err);
      savedErr = err;

      return null;
    });
    if (savedErr) {
      return res.status(500).send({ success: false });
    }
  } else {
    permissions = {
      buyer: true,
      companyAdminAccess: false
    };
  }

  const urId = await generateUrId(user);
  const name = 'user ' + makeRandomString(11, 'letters');
  const newUser = new user({
    companyId: company._id || null,
    urId,
    fname: name,
    lname: name,
    phone,
    email,
    password: passwd,
    permissions,
    expireAt,
    countryCode: '+256',
    userType
  });

  let response: Iauthresponse = {
    success: true
  };

  const saved = await newUser.save().catch(err => {
    authLogger.error(`mongosse registration 
    validation error, ${err}`);
    response = {
      status: 403,
      success: false
    };
    if (err && err.errors) {
      response.err = stringifyMongooseErr(err.errors);
    } else {
      response.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }

    return err;
  });

  if (!response.success) {
    return res.status(response.status).send(response);
  }

  if (savedSub && savedSub._id) {
    addParentToLocals(res, savedSub._id, user.collection.collectionName, 'makeTrackEdit');
  }

  if (company) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    company.owner = (saved)._id;
    let savedErr: string;

    await company.save().catch(err => {
      authLogger.error('save error', err);
      savedErr = err;

      return null;
    });
    if (savedErr) {
      return res.status(500).send({ success: false });
    }
  }

  // note now is only token but build a counter later to make sure that the token and link methods are shared
  const type = 'token';

  if (isPhone) {
    response = await sendTokenPhone(saved);
  } else {
    response = await sendTokenEmail(saved as unknown as Iuser, type, stockAuthConfig.localSettings.appOfficialName);
  }

  if (!response.success) {
    await user.deleteOne({ _id: (saved)._id });
    if (company) {
      await companyMain.deleteOne({ _id: company._id });
    }
    if (savedSub) {
      await companySubscriptionMain.deleteOne({ _id: savedSub._id });
    }

    return res.status(200).send(response);
  }
  if (Boolean(response.success)) {
    const toReturn: Iauthresponse = {
      success: true,
      msg: response.msg,
      _id: (saved)._id
    };

    return res.status(200).send(toReturn);
  }
  const toSend = {
    success: false,
    err: 'we could not process your request, something went wrong, but we are working on it'
  };

  return res.status(500).send(toSend);
};

export const userLoginRelegator = async(req: Request, res: Response, next: NextFunction) => {
  authLogger.info('userLoginRelegator');
  const { emailPhone, userType } = req.body;
  const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
  let { foundUser } = req.body;

  let filter2: object = {};

  if (userType) {
    filter2 = { userType };
  } else {
    filter2 = { userType: { $ne: 'customer' } };
  }

  if (!foundUser) {
    foundUser = await userLean
      .findOne({ ...query, ...filter2 })
      .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
      ])
      .lean()
    // .select(userAuthSelect)
      .catch(err => {
        authLogger.error(
          'Find user projection err',
          err
        );

        return null;
      });
  }

  if (!foundUser) {
    return res.status(404).send({ msg: 'Account does not exist!' });
  }

  if (!foundUser?.password || !foundUser?.verified) {
    return next();
  }

  const responseObj = await makeUserReturnObject(foundUser);

  const nowResponse: Iauthresponse = {
    success: true,
    ...responseObj
  };

  return res.status(200).send(nowResponse);
};

const reoveUploadedFiles = async(
  parsed: { profilePic?: string; coverPic?: string; newPhotos?: string[] },
  directlyRemove: boolean
) => {
  authLogger.info('reoveUploadedFiles');
  let _ids = [];

  if (parsed.profilePic) {
    _ids.push(parsed.profilePic);
  }

  if (parsed.coverPic) {
    _ids.push(parsed.coverPic);
  }

  if (parsed.newPhotos) {
    _ids = [..._ids, ...parsed.newPhotos];
  }
  if (_ids.length === 0) {
    return true;
  }

  const filesWithDir = await fileMetaLean.find({ _id: { $in: _ids } }).lean().select({ _id: 1, url: 1 });

  if (filesWithDir && filesWithDir.length > 0) {
    await deleteAllFiles(filesWithDir, directlyRemove);
  }

  return true;
};

export const addUser = async(
  req: IcustomRequest<never, {
    user: Iuser; profilePic?: string; coverPic?: string; newPhotos?: string[];
  }>,
  res: Response, next: NextFunction
) => {
  authLogger.info('adding user');
  const userData = req.body.user;
  const parsed = req.body;

  const { filter } = makeCompanyBasedQuery(req);

  const foundEmail = await userLean.findOne({ email: userData.email }).select({ email: 1 }).lean();

  if (foundEmail) {
    await reoveUploadedFiles(parsed, true);

    return res.status(401).send({ success: false, err: 'Email already exist found' });
  }
  const foundPhone = await userLean.findOne({ phone: userData.phone }).select({ phone: 1 }).lean();

  if (foundPhone) {
    await reoveUploadedFiles(parsed, true);

    return res.status(401).send({ success: false, err: 'Phone Number already exist found' });
  }

  userData.companyId = userData.companyId || filter.companyId;

  if (parsed.profilePic) {
    userData.profilePic = parsed.profilePic || userData.profilePic;
  }

  if (parsed.coverPic) {
    userData.profileCoverPic = parsed.coverPic || userData.profileCoverPic;
  }

  if (parsed.newPhotos) {
    userData.photos = parsed.newPhotos;
    if (!parsed.profilePic) {
      userData.profilePic = parsed.newPhotos[0];
    }
  }

  userData.urId = await generateUrId(user);
  const newUser = new user(userData);
  let status = 200;
  let response: Iauthresponse = { success: true };
  const savedUser = await newUser.save().catch((err) => {
    status = 403;
    const errResponse: Isuccess = {
      success: false
    };

    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }
    response = errResponse;
  });

  if (savedUser && savedUser._id) {
    addParentToLocals(res, savedUser._id, user.collection.collectionName, 'makeTrackEdit');
  }

  if (!response.err && savedUser) {
    response = {
      success: true,
      _id: savedUser._id
    };
    req.body.user = savedUser;

    return next();
  }

  return res.status(status).send(response);
};

export const updateUserBulk = async(
  req: IcustomRequest<never, {
    user: Iuser; profilePic?: string; coverPic?: string; newPhotos?: string[] | IfileMeta[]; profileOnly: string;
  }>,
  res: Response,
  next: NextFunction
) => {
  const updatedUser = req.body.user;
  const { filter } = makeCompanyBasedQuery(req);

  const { _id } = updatedUser;

  if (!_id) {
    return res.status(401).send({ success: false, err: 'unauthourised' });
  }

  const isValid = verifyObjectIds([_id]);

  if (!isValid) {
    return res.status(401).send({ success: false, err: 'unauthourised' });
  }


  let filter2 = { _id } as object;


  if (req.body.profileOnly === 'true') {
    const { userId } = req.user;

    filter2 = { user: userId };
  }

  const parsed = req.body;

  const foundUser = await user
    .findOne({ ...filter, ...filter2 });

  if (!foundUser) {
    if (parsed.newPhotos) {
      await deleteAllFiles(parsed.newPhotos as IfileMeta[], true);
    }

    return res.status(404).send({ success: false });
  }

  if (!foundUser.urId) {
    foundUser.urId = await generateUrId(user);
  }

  if (parsed) {
    if (parsed.profilePic) {
      foundUser.profilePic = parsed.profilePic || foundUser.profilePic;
    }

    if (parsed.coverPic) {
      foundUser.profileCoverPic = parsed.coverPic || foundUser.profileCoverPic;
    }

    if (parsed.newPhotos) {
      const oldPhotos = foundUser.photos || [];

      foundUser.photos = [...oldPhotos, ...parsed.newPhotos] as string[];
    }
  }
  delete updatedUser._id;

  const keys = Object.keys(updatedUser);

  keys.forEach(key => {
    if (filter.companyId === 'superAdmin' && key !== 'companyId' && key !== 'userType' && key !== '_id') {
      foundUser[key] = updatedUser[key] || foundUser[key];
    } else if (foundUser[key] &&
      key !== 'password' &&
      key !== 'email' &&
      key !== 'phone' &&
      key !== 'companyId' &&
      key !== 'userType') {
      foundUser[key] = updatedUser[key] || foundUser[key];
    }
  });

  const status = 200;
  let response: Iauthresponse = { success: true };

  const savedUser = await foundUser.save().catch((err) => {
    const errResponse: Isuccess = {
      success: false
    };

    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }
    response = errResponse;

    return err;
  });

  if (response.success) {
    req.body.user = savedUser as Iuser;

    return next();
  }

  return res.status(status).send(response);
};

export const removeOneUser = async(
  req: IcustomRequest<never, { _id: string; userId: string }>,
  res: Response,
  next: NextFunction
) => {
  const _id = req.body.userId || req.body._id;

  const isValid = verifyObjectIds([_id]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const found = await user.findOne({ _id })
    .populate([populatePhotos() ])
    .lean();

  if (found) {
    if (found.userType === 'eUser') {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const filesWithDir = found.photos.map(photo => (
      {
        _id: photo._id,
        url: photo.url
      }
    ));

    await deleteAllFiles(filesWithDir);
  }

  /* const deleted = await user
    .findOneAndDelete({ _id, }); */

  const deleted = await user
    .updateOne({ _id }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    addParentToLocals(res, _id, user.collection.collectionName, 'makeTrackEdit');

    return next();
  } else {
    return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
};

export const removeManyUsers = async(
  req: IcustomRequest<never, { userIds?: string[] } & IdeleteMany>,
  res: Response,
  next: NextFunction
) => {
  const ids = req.body?.userIds.length ? req.body.userIds : req.body._ids;
  const isValid = verifyObjectIds([...ids]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  let filesWithDir: IfileMeta[];
  const alltoDelete = await user.find({ _id: { $in: ids } })
    .populate([
      populateProfilePic(true),
      populateProfileCoverPic(true), populatePhotos(true), populateTrackEdit(), populateTrackView() ])
    .lean();

  for (const user of alltoDelete) {
    if (user.photos?.length > 0) {
      filesWithDir = [...filesWithDir, ...user.photos as IfileMeta[]];
    }
  }

  await deleteAllFiles(filesWithDir);

  /* const deleted = await user
      .deleteMany({  _id: { $in: newUserIds } })
      .catch(err => {
        localUserRoutesLogger.error('deletemany - err: ', err);

        return null;
      }); */

  const deleted = await user
    .updateMany({ _id: { $in: ids } }, {
      $set: { isDeleted: true }
    })
    .catch(err => {
      authLogger.error('deletemany - err: ', err);

      return null;
    });


  if (!Boolean(deleted)) {
    return res.status(405).send({
      success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
  next();
};

export const socialLogin = (provider: string) => {
  return async(req: IcustomRequestSocial, res) => {
    const userProp = req.user;

    authLogger.debug(`sociallogin, 
    provider: ${provider}`);

    const foundUser = await user.findOne({ email: userProp.email });

    if (!foundUser) {
      const urId = await generateUrId(user);

      const newUser = new user({
        urId,
        fname: userProp.username || userProp.name,
        lname: userProp.name || userProp.username,
        phone: userProp.phone,
        email: userProp.email,
        admin: false,
        expireAt: '',
        verified: true,
        socialAuthFrameworks: [{ providerName: provider, id: userProp.id }],
        profilepic: {
          url: userProp.photo as string
        },
        countryCode: +256
      });

      let errResponse: Isuccess;

      const nUser = await newUser.save().catch(err => {
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

        return err;
      });

      if (nUser && nUser._id) {
        addParentToLocals(res, nUser._id, user.collection.collectionName, 'makeTrackEdit');
      }

      if (errResponse) {
        return res.status(403).send(errResponse);
      } else {
        return res.status(200).send({
          success: true,
          user: nUser.toAuthJSON()
        });
      }
    } else {
      const file: IfileMeta = {
        url: userProp.photo
      };

      foundUser.profilePic = file;
      const socialAuthFrameworks = foundUser.socialAuthFrameworks;
      const found = socialAuthFrameworks.find(saf => saf.providerName === 'google');

      if (!found) {
        socialAuthFrameworks.push({ providerName: 'google', id: userProp.id });
      }

      foundUser.socialAuthFrameworks = socialAuthFrameworks;
      let status = 200;
      let response: Iauthresponse = { success: true };

      await foundUser.save().catch(err => {
        status = 403;
        const errResponse: Isuccess = {
          success: false
        };

        if (err && err.errors) {
          errResponse.err = stringifyMongooseErr(err.errors);
        } else {
          errResponse.err = `we are having problems connecting to our databases, 
          try again in a while`;
        }
        response = errResponse;

        return err;
      });

      if (status === 200) {
        response = {
          success: true,
          user: foundUser.toAuthJSON() as Iuser
        };

        return res.status(200).send(response);
      } else {
        return res.status(403).send(response);
      }
    }
  };
};

userAuthRoutes.get('/authexpress2', requireAuth, async(req: IcustomRequest<never, null>, res) => {
  const { userId } = req.user;
  const isValid = verifyObjectId(userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const foundUser = await userLean
    .findById(userId)
    .populate([
      populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
    ])
    // .populate({ path: 'companyId', model: companyLean })
    .lean()
    .select(userAuthSelect)
    .catch(err => {
      authLogger.error(
        'Find user projection err',
        err
      );
      // return false;
    });

  if (!foundUser) {
    const response: Iauthresponse = {
      success: false,
      err: 'Acccount does not exist!'
    };

    return res.status(401).send(response);
  }

  if (foundUser.blocked.status === true) {
    const response: Iauthresponse = {
      success: false,
      err: `This Acccount has been blocked
                due to suspicious activities please contact,
                support`
    };

    return res.status(401).send(response);
  }

  const responseObj = await makeUserReturnObject(foundUser);

  const nowResponse: Iauthresponse = {
    success: true,
    ...responseObj
  };

  return res.status(200).send(nowResponse);
});

userAuthRoutes.post('/login', async(
  req: IcustomRequest<never, {
    emailPhone: string; userType: string; isPhone: boolean; foundUser: Iuser;
  }>,
  res,
  next
) => {
  // req.body.from = 'user'; // TODO remove this
  const { emailPhone, userType } = req.body;

  let filter2: object = {};

  if (userType) {
    filter2 = { userType };
  } else {
    filter2 = { userType: { $ne: 'customer' } };
  }

  authLogger.debug(`login attempt,
    emailPhone: ${emailPhone}, userType: ${userType}`);
  const { query, isPhone } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
  const foundUser = await user.findOne({ ...query, ...filter2 })
    .populate([
      populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
    ]);

  if (!foundUser) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  req.body.isPhone = isPhone;
  req.body.foundUser = foundUser;

  return next();
}, checkIpAndAttempt, userLoginRelegator, recoverAccountFactory);


userAuthRoutes.get('/authexpress', requireAuth, async(req: IcustomRequest<never, null>, res, next) => {
  // req.body.from = 'user' // TODO;
  authLogger.debug('authexpress');
  const { userId } = req.user;

  const foundUser = await user.findOne({ _id: userId, ... { userType: { $ne: 'customer' }, verified: true } })
    .populate([
      populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
    ]);

  if (!foundUser) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  return next();
}, checkIpAndAttempt, userLoginRelegator, recoverAccountFactory);


// okay
userAuthRoutes.post(
  '/signup',
  (req: IcustomRequest<never, unknown>, res, next) => {
    return next();
  },
  isTooCommonPhrase,
  isInAdictionaryOnline,
  signupFactorRelgator,
  recoverAccountFactory,
  (req: IcustomRequest<never, unknown>, res) => {
    return res.status(401).send({ success: false, msg: 'unauthourised' });
  }
);

userAuthRoutes
  .post('/recover', async(req: IcustomRequest<never, { emailPhone: string; foundUser?: Iuser}>, res, next) => {
    const emailPhone = req.body.emailPhone;

    authLogger.debug(`recover, 
    emailphone: ${emailPhone}`);
    const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);

    const foundUser = await user.findOne({ ...query, ...{ userType: { $ne: 'customer' } } })
      .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
      ]);

    req.body.foundUser = foundUser;

    return next();
  }, recoverAccountFactory);

userAuthRoutes.post(
  '/confirm',
  async(req: IcustomRequest<never, {
    _id: string; verifycode: string; useField: 'email' | 'phone'; foundUser: Iuser;}>, res, next) => {
    const { _id, verifycode, useField } = req.body;

    authLogger.debug(`verify, verifycode: ${verifycode}, useField: ${useField}`);
    const isValid = verifyObjectIds([_id]);

    if (!isValid) {
      return {
        status: 401,
        response: {
          success: false,
          err: 'unauthourised'
        }
      };
    }
    const foundUser = await user.findById(_id)
      .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
      ]);

    req.body.foundUser = foundUser;

    return next();
  },
  confirmAccountFactory
);

userAuthRoutes.put(
  '/resetpaswd',
  async(req: IcustomRequest<never, { _id: string; verifycode: string; foundUser: Iuser}>, res, next) => {
    const { _id, verifycode } = req.body;

    authLogger.debug(`resetpassword, 
    verifycode: ${verifycode}`);
    const isValid = verifyObjectIds([_id]);

    if (!isValid) {
      return {
        status: 401,
        response: {
          success: false,
          err: 'unauthourised'
        }
      };
    }
    const foundUser = await user.findById(_id)
      .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
      ]);

    req.body.foundUser = foundUser;

    return next();
  },
  resetAccountFactory
);

userAuthRoutes.post(
  '/manuallyverify/:userId',
  requireAuth,
  roleAuthorisation('users', 'update'),
  async(req: IcustomRequest<{ userId: string }, unknown>, res) => {
    const { userId } = req.params;
    const { companyId } = req.user;

    const isValid = verifyObjectIds([userId, companyId]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!stockAuthConfig || !stockAuthConfig.localSettings || stockAuthConfig.localSettings.production) {
      return res.status(401).send({ success: false, er: 'unauthourized' });
    }

    const foundUser = await user
      .findOneAndUpdate({ _id: userId });

    if (!foundUser) {
      return res.status(401).send({
        success: false,
        err: 'Account does not exist'
      });
    }

    foundUser.verified = true;

    return res.status(200).send({ success: true });
  }
);

userAuthRoutes.get('/login/facebook', passport.authenticate('facebook'));
userAuthRoutes.get('/login/google', passport.authenticate('google'));

userAuthRoutes.get(
  '/oauth2/redirect/facebook',
  passport.authenticate('facebook'),
  socialLogin('facebook'),
  checkIpAndAttempt,
  userLoginRelegator
);
userAuthRoutes.get(
  '/oauth2/redirect/google',
  passport.authenticate('google'),
  socialLogin('google'),
  checkIpAndAttempt,
  userLoginRelegator
);

userAuthRoutes.put(
  '/updatepermissions/:_id',
  requireAuth,
  roleAuthorisation('users', 'update'),
  async(req: IcustomRequest<{ _id: string}, Iuserperm>, res) => {
    const { _id } = req.params;
    const isValid = verifyObjectId(_id);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    authLogger.debug('updatepermissions');
    const foundUser = await user
      .findById(_id);

    if (!foundUser) {
      return res.status(401).send({
        success: false,
        err: 'Account does not exist'
      });
    }
    foundUser.permissions = req.body || foundUser.permissions;

    let status = 200;
    let response: Isuccess = { success: true };

    await foundUser.save().catch(err => {
      status = 403;
      const errResponse: Isuccess = {
        success: false
      };

      if (err && err.errors) {
        errResponse.err = stringifyMongooseErr(err.errors);
      } else {
        errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
      }
      response = errResponse;
    });

    return res.status(status).send(response);
  }
);

userAuthRoutes.get(
  '/one/:urId',
  requireAuth,
  roleAuthorisation('users', 'read'),
  async(req: IcustomRequest<{ urId: string }, null>, res) => {
    const { urId } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    // let companyId: string;

    /* if (companyId === 'superAdmin' && companyIdParam !== 'undefined') {
    companyId = companyIdParam;
  } else {
    companyId = companyId;
  } */
    /* if (companyId || companyId !== 'superAdmin') {
    const isValid = verifyObjectId(companyId);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
  } */
    const oneUser = await userLean
      .findOne({ urId, ...filter })
      .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
      ])
      .populate({ path: 'companyId', model: companyLean })
      .lean();

    if (!oneUser || (oneUser && oneUser.blocked)) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    if (filter.companyId &&
    filter.companyId !== 'all' &&
    filter.companyId !== 'undefined' &&
    oneUser.companyId &&
    (oneUser.companyId as Icompany).blocked) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, oneUser._id, user.collection.collectionName, 'trackDataView');

    return res.status(200).send(oneUser);
  }
);

userAuthRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { filter } = makeCompanyBasedQuery(req);
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;

    authLogger.info('filter is ', filter);
    const all = await Promise.all([
      userLean
        .find({ verified: true, userType: { $ne: 'company' }, ...filter })
        .sort({ fname: 1 })
        .limit(Number(currLimit))
        .skip(Number(currOffset))
        .populate([
          populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
        ])
        .populate({ path: 'companyId', model: companyLean, select: { name: 1, blocked: 1 } })
        .lean(),
      userLean.countDocuments({ verified: true, userType: { $ne: 'company' }, ...filter })

    ]);
    const filteredUsers = all[0].filter(data => {
      if (filter.companyId && filter.companyId !== 'all' && filter.companyId !== 'undefined') {
        return !(data.companyId as Icompany).blocked;
      }

      return true;
    });
    const response: IdataArrayResponse<Tuser> = {
      count: all[1],
      data: filteredUsers
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, user.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

userAuthRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);

    const filter = constructFiltersFromBody(req);

    const aggCursor = userLean.aggregate<IfilterAggResponse<Tuser>>([
      {
        $match: {
          $and: [
          // { status: 'pending' },
            ...filter
          ]
        }
      },
      ...lookupTrackEdit(),
      ...lookupTrackView(),
      {
        $facet: {
          data: [...lookupSort(propSort), ...lookupOffset(offset), ...lookupLimit(limit)],
          total: [{ $count: 'count' }]
        }
      },
      {
        $unwind: {
          path: '$total',
          preserveNullAndEmptyArrays: true
        }
      }
    ]);
    const dataArr: IfilterAggResponse<Tuser>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const response: IdataArrayResponse<Tuser> = {
      count,
      data: all
    };

    for (const val of all) {
      addParentToLocals(res, val._id, user.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

userAuthRoutes.post(
  '/add',
  requireAuth,
  roleAuthorisation('users', 'create'),
  addUser,
  (req: IcustomRequest<never, unknown>, res) => {
    return res.status(200).send({ success: true });
  }
);

userAuthRoutes.post(
  '/add/img',
  requireAuth,
  roleAuthorisation('users', 'create'),
  uploadFiles,
  appendBody,
  saveMetaToDb,
  addUser,
  (req: IcustomRequest<never, unknown>, res) => {
    return res.status(200).send({ success: true });
  }
);

userAuthRoutes.put(
  '/update',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'update'),
  updateUserBulk,
  (req: IcustomRequest<never, unknown>, res) => {
    return res.status(200).send({ success: true });
  }
);

userAuthRoutes.post(
  '/update/img',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'update'),
  uploadFiles,
  appendBody,
  saveMetaToDb,
  updateUserBulk,
  (req: IcustomRequest<never, unknown>, res) => {
    return res.status(200).send({ success: true });
  }
);

userAuthRoutes.put(
  '/delete/many',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'delete'),
  removeManyUsers,
  (req: IcustomRequest<never, IdeleteMany>, res) => {
    return res.status(200).send({ success: true });
  }
);

userAuthRoutes.put(
  '/delete/one',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'delete'),
  removeOneUser,
  (req: IcustomRequest<never, IdeleteOne>, res) => {
    return res.status(200).send({ success: true });
  }
);

userAuthRoutes.put(
  '/delete/images',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('users', 'delete'),
  deleteFiles(true),
  async(req: IcustomRequest<never, { filesWithDir: IfileMeta[]; user: Partial<Iuser>}>, res) => {
    const filesWithDir: IfileMeta[] = req.body.filesWithDir;
    const { companyId } = req.user;


    if (filesWithDir && !filesWithDir.length) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedUser = req.body.user;

    const { _id } = updatedUser;
    const isValid = verifyObjectIds([_id, companyId]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user
      .findOneAndUpdate({ _id });

    if (!foundUser) {
      return res.status(404).send({ success: false, err: 'item not found' });
    }
    const photos = foundUser.photos;
    const filesWithDirIds = filesWithDir
      .map(val => val._id);

    foundUser.photos = photos
      .filter((p: string) => !filesWithDirIds.includes(p)) as string[];
    foundUser.profilePic = foundUser.photos.find(p => p === foundUser.profilePic);
    foundUser.profileCoverPic = foundUser.photos.find(p => p === foundUser.profileCoverPic);
    let errResponse: Isuccess;

    await foundUser.save().catch(err => {
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

    return res.status(200).send({ success: true });
  }
);

userAuthRoutes.get('/existsemailphone/:emailPhone', async(req: IcustomRequest<{ emailPhone: string }, null>, res) => {
  const { emailPhone } = req.params;
  const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
  const foundUser = await user.findOne({ ...query }).lean().select({ _id: 1 });

  return res.status(401).send({ success: true, exists: Boolean(foundUser) });
});

