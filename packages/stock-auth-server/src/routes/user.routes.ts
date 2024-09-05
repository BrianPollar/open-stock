import {
  Iaddress,
  Iauthresponse, Ibilling,
  Icompany,
  Icustomrequest,
  IdataArrayResponse,
  IfileMeta,
  Isuccess, Iuser,
  Iuserperm,
  TuserType,
  makeRandomString,
  subscriptionPackages
} from '@open-stock/stock-universal';
import {
  addParentToLocals,
  appendBody,
  deleteAllFiles,
  deleteFiles,
  fileMetaLean, makeCompanyBasedQuery, makeUrId,
  offsetLimitRelegator,
  requireAuth,
  roleAuthorisation,
  saveMetaToDb,
  stringifyMongooseErr, uploadFiles,
  verifyObjectId,
  verifyObjectIds
} from '@open-stock/stock-universal-server';
import express, { Request, Response } from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { companyLean, companyMain } from '../models/company.model';
import { companySubscriptionMain } from '../models/subscriptions/company-subscription.model';
import { user, userAuthSelect, userLean } from '../models/user.model';
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
import { populatePhotos, populateProfileCoverPic, populateProfilePic, populateTrackEdit, populateTrackView } from '../utils/query';
import { makeUserReturnObject, sendTokenEmail, sendTokenPhone } from '../utils/universial';
import { requireActiveCompany } from './company-auth';
import { getDays } from './subscriptions/company-subscription.routes';
import { requireSuperAdmin } from './superadmin.routes';
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

/**
 * Handles the login and registration process for superadmin users.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A Promise that resolves to void.
 */
// eslint-disable-next-line max-statements
export const signupFactorRelgator = async(req, res, next) => {
  const { emailPhone } = req.body;
  const userType: TuserType = req.body.userType || 'eUser';
  const passwd = req.body.passwd;
  let phone;
  let email;
  let query;
  let isPhone: boolean;

  authLogger.debug(`signup, 
    emailPhone: ${emailPhone}`);

  if (isNaN(emailPhone)) {
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
    const companyCount = await companyMain
      .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const companyUrId = makeUrId(Number(companyCount[0]?.urId || '0'));
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

  const count = await user
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
  const urId = makeUrId(Number(count[0]?.urId || '0'));
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

  const type = 'token'; // note now is only token but build a counter later to make sur that the token and link methods are shared

  if (isPhone) {
    response = await sendTokenPhone(saved);
  } else {
    response = await sendTokenEmail(saved as unknown as Iuser, type, stockAuthConfig.localSettings.appOfficialName);
  }

  if (!response.success) {
    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
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

/**
 * Handles the user login request.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the user information and token.
 */
export const userLoginRelegator = async(req: Request, res: Response, next) => {
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
      .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()])
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


/**
   * Remove all the uploaded files from the parsed object.
   * @param {object} parsed - Object that contains the fields to remove.
   * @param {boolean} directlyRemove - If true, remove the files directly.
   * @returns {Promise<boolean>} - True if all the files were removed.
   */
const reoveUploadedFiles = async(parsed, directlyRemove: boolean) => {
  let ids = [];

  if (parsed.profilePic) {
    ids.push(parsed.profilePic);
  }

  if (parsed.coverPic) {
    ids.push(parsed.coverPic);
  }

  if (parsed.newPhotos) {
    ids = [...ids, ...parsed.newPhotos];
  }
  if (ids.length === 0) {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const filesWithDir = await fileMetaLean.find({ _id: { $in: ids } }).lean().select({ _id: 1, url: 1 });

  if (filesWithDir && filesWithDir.length > 0) {
    await deleteAllFiles(filesWithDir, directlyRemove);
  }

  return true;
};

/**
   * Adds a new user with the provided values and optional files.
   * @param {object} req - Express Request object.
   * @param {object} res - Express Response object.
   * @param {function} next - Express NextFunction object.
   * @returns {Promise<void>}
   */
export const addUser = async(req, res, next) => {
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
  if (req.params?.companyIdParam && req.params?.companyIdParam !== 'undefined' && req.params?.companyIdParam !== 'all') {
    userData.companyId = filter.companyId;
  }

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

  const count = await user
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

  userData.urId = makeUrId(Number(count[0]?.urId || '0'));
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
    req.body.savedUser = savedUser;

    return next();
  }

  return res.status(status).send(response);
};

/**
   * Updates the user's profile with the provided values and optional files.
   * @param companyId - The ID of the company
   * @param vals The values to update the user's profile with.
   * @param files Optional files to upload with the user.
   * @returns A success object indicating whether the user was updated successfully.
   */
export const updateUserBulk = async(req, res, next) => {
  const updatedUser = req.body.user;
  const { filter } = makeCompanyBasedQuery(req);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id } = updatedUser;

  if (!_id) {
    return res.status(401).send({ success: false, err: 'unauthourised' });
  }

  const isValid = verifyObjectIds([_id]);

  if (!isValid) {
    return res.status(401).send({ success: false, err: 'unauthourised' });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  let filter2 = { _id } as object;


  if (req.body.profileOnly === 'true') {
    const { userId } = (req as Icustomrequest).user;

    filter2 = { user: userId };
  }

  const parsed = req.body;

  const foundUser = await user
    .findOne({ ...filter, ...filter2 });

  if (!foundUser) {
    if (parsed.newPhotos) {
      await deleteAllFiles(parsed.newPhotos, true);
    }

    return res.status(404).send({ success: false });
  }

  if (!foundUser.urId) {
    const count = await user
      .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

    foundUser.urId = makeUrId(Number(count[0]?.urId || '0'));
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
    } else if (foundUser[key] && key !== 'password' && key !== 'email' && key !== 'phone' && key !== 'companyId' && key !== 'userType') {
      foundUser[key] = updatedUser[key] || foundUser[key];
    }
  });

  const status = 200;
  let response: Iauthresponse = { success: true };

  await foundUser.save().catch((err) => {
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

  if (response.success) {
    return next();
  }

  return res.status(status).send(response);
};

userAuthRoutes.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


userAuthRoutes.get('/authexpress2', requireAuth, async(req, res) => {
  const { userId } = (req as Icustomrequest).user;
  const isValid = verifyObjectId(userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const foundUser = await userLean
    .findById(userId)
    .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView() ])
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

userAuthRoutes.post('/login', async(req, res, next) => {
  req.body.from = 'user';
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
    .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView() ]);

  if (!foundUser) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  req.body.isPhone = isPhone;
  req.body.foundUser = foundUser;

  return next();
}, checkIpAndAttempt, userLoginRelegator, recoverAccountFactory);


userAuthRoutes.get('/authexpress', requireAuth, async(req, res, next) => {
  req.body.from = 'user';
  authLogger.debug('authexpress');
  const { userId } = (req as Icustomrequest).user;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const foundUser = await user.findOne({ _id: userId, ... { userType: { $ne: 'customer' }, verified: true } })
    .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView() ]);

  if (!foundUser) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  return next();
}, checkIpAndAttempt, userLoginRelegator, recoverAccountFactory);


// okay
userAuthRoutes.post('/signup', (req, res, next) => {
  return next();
}, isTooCommonPhrase, isInAdictionaryOnline, signupFactorRelgator, recoverAccountFactory, (req, res) => {
  return res.status(401).send({ success: false, msg: 'unauthourised' });
});

userAuthRoutes.post('/recover', async(req, res, next) => {
  const emailPhone = req.body.emailPhone;

  authLogger.debug(`recover, 
    emailphone: ${emailPhone}`);
  const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);

  const foundUser = await user.findOne({ ...query, ...{ userType: { $ne: 'customer' } } })
    .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView() ]);

  req.body.foundUser = foundUser;

  return next();
}, recoverAccountFactory);

userAuthRoutes.post('/confirm', async(req, res, next) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id, verifycode, nowHow } = req.body;

  authLogger.debug(`verify, verifycode: ${verifycode}, how: ${nowHow}`);
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
    .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView() ]);

  req.body.foundUser = foundUser;

  return next();
}, confirmAccountFactory);

userAuthRoutes.put('/resetpaswd', async(req, res, next) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
    .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView() ]);

  req.body.foundUser = foundUser;

  return next();
}, resetAccountFactory);

userAuthRoutes.post('/manuallyverify/:userId/:companyIdParam', requireAuth, roleAuthorisation('users', 'update'), async(req, res) => {
  const { userId, companyIdParam } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([userId, queryId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  if (!stockAuthConfig || !stockAuthConfig.localSettings || stockAuthConfig.localSettings.production) {
    return res.status(401).send({ success: false, er: 'unauthourized' });
  }

  const foundUser = await user
    .findOneAndUpdate({ _id: userId, companyId: queryId });

  if (!foundUser) {
    return res.status(401).send({
      success: false,
      err: 'Account does not exist'
    });
  }

  foundUser.verified = true;

  return res.status(200).send({ success: true });
});


userAuthRoutes.post('/sociallogin', async(req, res) => {
  const credentials = req.body;

  authLogger.debug(`sociallogin, 
    socialId: ${credentials.socialId}`);
  const foundUser = await user.findOne({
    fromsocial: true,
    socialframework: credentials.type,
    socialId: credentials.socialId
  });

  if (!foundUser) {
    const count = await user
      .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = makeUrId(Number(count[0]?.urId || '0'));

    const newUser = new user({
      urId,
      fname: credentials.fname,
      lname: credentials.lname,
      phone: '',
      email: credentials.email,
      admin: false,
      expireAt: '',
      verified: true,
      fromsocial: true,
      socialframework: credentials.type,
      socialId: credentials.socialId,
      profilepic: credentials.profilepic,
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
    foundUser.fname = credentials.name;
    const file: IfileMeta = {
      url: credentials.profilepic
    };

    foundUser.profilePic = file;
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
});

userAuthRoutes.put('/updateprofile/:formtype/:companyIdParam', requireAuth, async(req, res) => {
  const { userId } = (req as unknown as Icustomrequest).user;
  const { userdetails } = req.body;
  const { formtype } = req.params;
  let users;
  let success = true;
  let error;
  let status = 200;

  authLogger.debug(`updateprofile, 
    formtype: ${formtype}`);

  const isValid = verifyObjectId(userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const foundUser = await user
    .findById(userId);

  if (!foundUser) {
    return res.status(401).send({
      success: false,
      err: 'Account does not exist'
    });
  }
  switch (formtype) {
    case 'name':
      foundUser.fname = userdetails.fname;
      foundUser.lname = userdetails.lname;
      break;
    case 'gender':
      foundUser.gender = userdetails.gender;
      break;
    case 'age':
      foundUser.age = userdetails.age;
      break;
    case 'phone':
      // compare password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      foundUser['comparePassword'](userdetails.passwd, function(err, isMatch) {
        if (err) {
          status = 401;
          success = false;
          error = 'invalid password';
          // throw err;
        }
      });

      /* if (foundUser.password !== userdetails.passwd) {
        status = 401;
        success = false;
        error = 'invalid password';
      } */
      users = await user
        .find({ phone: foundUser.phone });
      if (users) {
        status = 401;
        success = false;
        error = `phone number is in use
          by another Account`;
      } else {
        foundUser.phone = userdetails.phone;
      }
      break;
    case 'email':
      // compare password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      foundUser['comparePassword'](userdetails.passwd, function(err, isMatch) {
        if (err) {
          status = 200;
          success = false;
          error = 'invalid password';
        }
      });

      /* if (foundUser.password !== userdetails.passwd) {
        status = 200;
        success = false;
        error = 'invalid password';
      } */
      users = await user
        .find({ email: foundUser.email });
      if (users) {
        status = 200;
        success = false;
        error = `email address is in use by
          another Account`;
      } else {
        foundUser.email = userdetails.email;
      }
      break;
    case 'password':
      // compare password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      foundUser['comparePassword'](userdetails.oldPassword, function(err, isMatch) {
        if (err) {
          status = 200;
          success = false;
          error = 'invalid password';
        }
      });

      /* if (userdetails.oldPassword === foundUser.password) {
        foundUser.password = userdetails.password;
      } else {
        status = 200;
        success = false;
        error = 'invalid password';
      } */
      break;
  }

  let response: Iauthresponse = { success: true, err: error };

  if (success === true) {
    await foundUser.save().catch((err) => {
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
  }

  return res.status(status).send(response);
});

userAuthRoutes.post('/updateprofileimg/:companyIdParam', requireAuth, uploadFiles, appendBody, saveMetaToDb, async(req, res) => {
  let userId = req.body.user?._id;

  if (!userId) {
    userId = (req as unknown as Icustomrequest).user.userId;
  }

  const isValid = verifyObjectId(userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  authLogger.debug('updateprofileimg');
  const foundUser = await user
    .findById(userId);

  if (!foundUser) {
    return res.status(401).send({
      success: false,
      err: 'Account does not exist'
    });
  }
  const parsed = req.body.parsed;

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

  let status = 200;
  let response: Iauthresponse = { success: true };

  await foundUser.save().catch((err) => {
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
});

userAuthRoutes.put('/updatepermissions/:userId/:companyIdParam', requireAuth, roleAuthorisation('users', 'update'), async(req, res) => {
  const { userId } = req.params;
  const isValid = verifyObjectId(userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  authLogger.debug('updatepermissions');
  const foundUser = await user
    .findById(userId);

  if (!foundUser) {
    return res.status(401).send({
      success: false,
      err: 'Account does not exist'
    });
  }
  foundUser.permissions = req.body.permissions || foundUser.permissions;

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
  });

  return res.status(status).send(response);
});

userAuthRoutes.put('/blockunblock/:userId', requireAuth, requireSuperAdmin, async(req, res) => {
  const { userId } = req.paras;

  authLogger.debug('blockunblock');
  const isValid = verifyObjectId(userId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const foundUser = await user
    .findById(userId);

  if (!foundUser) {
    return res.status(401).send({
      success: false,
      err: 'Account does not exist'
    });
  }
  foundUser.blocked = req.body.blocked;

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
  });

  return res.status(status).send(response);
});

userAuthRoutes.put('/addupdateaddr/:userId/:companyIdParam', requireAuth, async(req, res) => {
  const { userId } = req.params;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;

  authLogger.debug('updatepermissions');
  const isValid = verifyObjectIds([userId, queryId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const foundUser = await user
    .findOneAndUpdate({ _id: userId, companyId: queryId });

  if (!foundUser) {
    return res.status(401).send({
      success: false,
      err: 'Account does not exist'
    });
  }

  const { address, how, type } = req.body;

  if (how === 'create') {
    if (type === 'billing') {
      foundUser.billing.push(address);
    } else {
      foundUser.address.push(address);
    }
  } else if (how === 'update') {
    let found: Iaddress | Ibilling;

    if (type === 'billing') {
      found = foundUser.billing.find(val => val.id === address.id) ;
    } else {
      found = foundUser.address.find(val => val.id === address.id) ;
    }
    if (found) {
      found = address;
    }
  } else if (type === 'billing') {
    foundUser.billing = foundUser.billing.filter(val => val.id !== address.id);
  } else {
    foundUser.address = foundUser.address.filter(val => val.id !== address.id);
  }

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
  });

  return res.status(status).send(response);
});

userAuthRoutes.get('/getoneuser/:urId/:companyIdParam', requireAuth, roleAuthorisation('users', 'read'), async(req, res) => {
  const { urId } = req.params;
  const { filter } = makeCompanyBasedQuery(req);
  // let queryId: string;

  /* if (companyId === 'superAdmin' && companyIdParam !== 'undefined') {
    queryId = companyIdParam;
  } else {
    queryId = companyId;
  } */
  /* if (queryId || companyId !== 'superAdmin') {
    const isValid = verifyObjectId(queryId);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
  } */
  const oneUser = await userLean
    .findOne({ urId, ...filter })
    .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView() ])
    .populate({ path: 'companyId', model: companyLean })
    .lean();

  if (oneUser && oneUser.blocked) {
    return res.status(200).send({});
  }

  if (filter.companyId &&
    filter.companyId !== 'all' &&
    filter.companyId !== 'undefined' &&
    oneUser.companyId &&
    (oneUser.companyId as Icompany).blocked) {
    return res.status(200).send({});
  }

  addParentToLocals(res, oneUser._id, user.collection.collectionName, 'trackDataView');

  return res.status(200).send(oneUser);
});

userAuthRoutes.get('/getusers/:where/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'read'), async(req, res) => {
  const { filter } = makeCompanyBasedQuery(req);

  /* let queryId: string;

  if (companyId === 'superAdmin' && companyIdParam !== 'undefined') {
    queryId = companyIdParam;
  } else {
    queryId = companyId;
  }
  if (queryId || companyId !== 'superAdmin') {
    const isValid = verifyObjectId(queryId);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
  } */
  const { where } = req.params;
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const currOffset = offset === 0 ? 0 : offset;
  const currLimit = limit === 0 ? 1000 : limit;
  let filter2;

  authLogger.info('where is ', where);

  switch (where) {
    /* case 'manual':
      filter = {
        manuallyAdded: true,
        companyId: queryId
      };
      break;
    case 'auto':
      filter = {
        manuallyAdded: false,
        companyId: queryId
      };
      break; */
    case 'customer':
      filter2 = {
        userType: 'customer'
      };
      break;
    case 'staff':
      filter2 = {
        userType: 'staff'
      };
      break;
    case 'registered':
      filter2 = { userType: { $ne: 'company' }, verified: true };
      break;
    default:
      filter2 = { userType: { $ne: 'company' } };
      break;
  }

  authLogger.info('filter is ', filter);
  const all = await Promise.all([
    userLean
      .find({ ...filter2, ...filter })
      .sort({ fname: 1 })
      .limit(Number(currLimit))
      .skip(Number(currOffset))
      .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView() ])
      .populate({ path: 'companyId', model: companyLean, select: { name: 1, blocked: 1 } })
      .lean(),
    userLean.countDocuments({ ...filter2, ...filter })

  ]);
  const filteredFaqs = all[0].filter(data => {
    if (filter.companyId && filter.companyId !== 'all' && filter.companyId !== 'undefined') {
      return !(data.companyId as Icompany).blocked;
    }

    return true;
  });
  const response: IdataArrayResponse = {
    count: all[1],
    data: filteredFaqs
  };

  for (const val of all[0]) {
    addParentToLocals(res, val._id, user.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

userAuthRoutes.post('/adduser/:companyIdParam', requireAuth, roleAuthorisation('users', 'create'), addUser, (req, res) => {
  return res.status(200).send({ success: true });
});

userAuthRoutes.post('/adduserimg/:companyIdParam', requireAuth, roleAuthorisation('users', 'create'), uploadFiles, appendBody, saveMetaToDb, addUser, (req, res) => {
  return res.status(200).send({ success: true });
});

userAuthRoutes.put('/updateuserbulk/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'update'), updateUserBulk, (req, res) => {
  return res.status(200).send({ success: true });
});

userAuthRoutes.post('/updateuserbulkimg/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'update'), uploadFiles, appendBody, saveMetaToDb, updateUserBulk, (req, res) => {
  return res.status(200).send({ success: true });
});

userAuthRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), async(req, res) => {
  const { ids } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([...ids, ...[queryId]]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  let filesWithDir: IfileMeta[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const alltoDelete = await user.find({ _id: { $in: ids }, companyId: queryId })
    .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos() ])
    .lean();
  let toDelIds = [];

  for (const user of alltoDelete) {
    if (user.userType === 'eUser') {
      toDelIds = [...toDelIds, user._id];
      if (user.photos?.length > 0) {
        filesWithDir = [...filesWithDir, ...user.photos as IfileMeta[]];
      }
    }
  }

  await deleteAllFiles(filesWithDir);

  /* const deleted = await user
    .deleteMany({ _id: { $in: toDelIds }, companyId: queryId }).catch(err => {
      authLogger.error('deletemany users failed with error: ' + err.message);

      return null;
    }); */

  const deleted = await user
    .updateMany({ _id: { $in: toDelIds }, companyId: queryId }, {
      $set: { isDeleted: true }
    }).catch(err => {
      authLogger.error('deletemany users failed with error: ' + err.message);

      return null;
    });

  if (Boolean(deleted)) {
    for (const val of toDelIds) {
      addParentToLocals(res, val, user.collection.collectionName, 'trackDataDelete');
    }

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});

userAuthRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), async(req, res) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id } = req.body;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectIds([_id, queryId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const found = await user.findOne({ _id, companyId: queryId })
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
    .findOneAndDelete({ _id, companyId: queryId }); */

  const deleted = await user
    .updateOne({ _id, companyId: queryId }, { $set: { isDeleted: true } });

  if (Boolean(deleted)) {
    addParentToLocals(res, _id, user.collection.collectionName, 'makeTrackEdit');

    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

userAuthRoutes.put('/deleteimages/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), deleteFiles(true), async(req, res) => {
  const filesWithDir: IfileMeta[] = req.body.filesWithDir;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;

  if (filesWithDir && !filesWithDir.length) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const updatedUser = req.body.user;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id } = updatedUser;
  const isValid = verifyObjectIds([_id, queryId]);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const foundUser = await user
    .findOneAndUpdate({ _id, companyId: queryId });

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
});

userAuthRoutes.get('/existsemailphone/:emailPhone', async(req, res) => {
  const { emailPhone } = req.params;
  const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
  const foundUser = await user.findOne({ ...query }).lean().select({ _id: 1 });

  return res.status(401).send({ success: true, exists: Boolean(foundUser) });
});
