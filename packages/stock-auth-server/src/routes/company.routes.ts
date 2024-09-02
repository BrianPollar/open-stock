/**
 * This file contains the authentication routes for the stock-auth-server package.
 * It exports the companyAuthRoutes router and companyLoginRelegator function.
 * It also imports various controllers and models from the same package and other packages.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { createNotifStn } from '@open-stock/stock-notif-server';
import { Iauthresponse, Icustomrequest, IdataArrayResponse, IfileMeta, Isuccess } from '@open-stock/stock-universal';
import {
  addParentToLocals,
  appendBody,
  deleteFiles, makeUrId,
  offsetLimitRelegator,
  requireAuth,
  roleAuthorisation,
  saveMetaToDb,
  stringifyMongooseErr, uploadFiles,
  verifyObjectId
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { companyLean, companyMain } from '../models/company.model';
import { user } from '../models/user.model';
import { populatePhotos, populateProfileCoverPic, populateProfilePic, populateTrackEdit, populateTrackView } from '../utils/query';
import { requireActiveCompany } from './company-auth';
import { requireSuperAdmin } from './superadmin.routes';
import { addUser, updateUserBulk } from './user.routes';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
// const passport = require('passport');

/**
 * Router for company authentication routes.
 */
export const companyAuthRoutes = express.Router();

export const addCompany = async(req, res) => {
  const savedUser = req.body.savedUser;
  const companyData = req.body.company;

  companyData.owner = savedUser._id;
  const parsed = req.body;

  if (parsed) {
    if (parsed.profilePic) {
      companyData.profilePic = parsed.profilePic || companyData.profilePic;
    }

    if (parsed.coverPic) {
      companyData.profileCoverPic = parsed.coverPic || companyData.profileCoverPic;
    }

    if (parsed.newPhotos) {
      companyData.photos = parsed.newPhotos;
    }
  }
  const count = await companyMain
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

  companyData.urId = makeUrId(Number(count[0]?.urId || '0'));
  const newCompany = new companyMain(companyData);
  let status = 200;
  let response: Iauthresponse = { success: true };
  const savedCompany = await newCompany.save().catch((err) => {
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

  if (savedCompany && savedCompany._id) {
    addParentToLocals(res, savedCompany._id, companyMain.collection.collectionName, 'makeTrackEdit');
  }

  if (!response.err && savedCompany) {
    const stn = {
      companyId: savedCompany._id,
      invoices: true,
      payments: true,
      orders: true,
      jobCards: true,
      users: true
    };

    await createNotifStn(stn);
    response = {
      success: true,
      _id: savedCompany._id
    };
  } else {
    await user.deleteOne({ _id: savedUser._id });
  }

  return res.status(status).send(response);
};

export const updateCompany = async(req, res) => {
  const { companyIdParam } = req.params;
  const updatedCompany = req.body.company;
  const { companyId } = (req as Icustomrequest).user;

  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;

  if (!queryId) {
    return res.status(401).send({ success: false, err: 'unauthourised' });
  }

  const isValid = verifyObjectId(companyIdParam);

  if (!isValid) {
    return res.status(401).send({ success: false, err: 'unauthourised' });
  }

  const foundCompany = await companyMain
    .findOne({ _id: queryId });

  if (!foundCompany) {
    return res.status(404).send({ success: false });
  }

  if (!foundCompany.urId) {
    const count = await companyMain
      .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });

    foundCompany.urId = makeUrId(Number(count[0]?.urId || '0'));
  }
  const parsed = req.body;

  if (parsed) {
    if (parsed.profilePic) {
      foundCompany.profilePic = parsed.profilePic || foundCompany.profilePic;
    }

    if (parsed.coverPic) {
      foundCompany.profileCoverPic = parsed.coverPic || foundCompany.profileCoverPic;
    }

    if (parsed.newPhotos) {
      const oldPhotos = foundCompany.photos || [];

      foundCompany.photos = [...oldPhotos, ...parsed.newPhotos] as string[];
    }
  }
  delete updatedCompany._id;

  const keys = Object.keys(updatedCompany);

  keys.forEach(key => {
    if (key !== '_id' && key !== 'phone' && key !== 'email') {
      foundCompany[key] = updatedCompany[key] || foundCompany[key];
    }
  });

  const status = 200;
  let response: Iauthresponse = { success: true };

  await foundCompany.save().catch((err) => {
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
};

/**
 * Logger for company authentication routes.
 */
const companyAuthLogger = tracer.colorConsole({
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
 * Handles the company login request.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the authentication token and user information.
 */
/* export const companyLoginRelegator = async(req: Request, res: Response) => {
  const { emailPhone } = req.body;

  const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);

  const foundCompany = await companyLean
    .findOne({ ...query, ... { verified: true } })
    .lean()
    .select(userAuthSelect)
    .catch(err => {
      companyAuthLogger.error('Find user projection err',
        err);
      return null;
    });

  const permissions = {
    companyAdminAccess: true
  };

  // delete user.password; //we do not want to send back password
  const userInfo: Iauthtoken = setUserInfo(
    foundCompany._id, // 'admin',
    permissions,
    foundCompany._id,
    {
      active: !foundCompany.blocked
    }
  );
  const token = generateToken(
    userInfo, '1d', stockAuthConfig.authSecrets.jwtSecret);
  const now = new Date();
  const subsctn = await companySubscriptionLean.findOne({ companyId: foundCompany._id, status: 'paid' })
    .lean()
    .gte('endDate', now)
    .sort({ endDate: 1 });

  const nowResponse: Iauthresponse = {
    success: true,
    user: foundCompany as Iuser,
    token,
    activeSubscription: subsctn
  };
  return res.status(200).send(nowResponse);
}; */

/* companyAuthRoutes.get('/authexpress/:companyIdParam', requireAuth, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const foundCompany = await companyLean
    .findById(queryId)
    .populate({ path: 'profilePic', model: fileMetaLean })
    .populate({ path: 'profileCoverPic', model: fileMetaLean })
    .populate({ path: 'photos', model: fileMetaLean })
    .lean()
    .select(userAuthSelect)
    .catch(err => {
      companyAuthLogger.error('Find user projection err',
        err);
      // return false;
    });

  if (!foundCompany) {
    const response: Iauthresponse = {
      success: false,
      err: 'Acccount does not exist!'
    };
    return res.status(401).send(response);
  }

  if (foundCompany.blocked === true) {
    const response: Iauthresponse = {
      success: false,
      err: `This Acccount has been blocked
                due to suspicious activities please contact,
                support`
    };
    return res.status(401).send(response);
  }

  const permissions = {
    companyAdminAccess: true
  };

  const userInfo: Iauthtoken = setUserInfo(
    'admin',
    permissions,
    foundCompany._id,
    {
      active: !foundCompany.blocked
    }
  );
  const token = generateToken(
    userInfo, '1d', stockAuthConfig.authSecrets.jwtSecret);
  const nowResponse: Iauthresponse = {
    success: true,
    user: foundCompany as Icompany,
    token
  };
  return res.status(200).send(nowResponse);
}); */

/* companyAuthRoutes.post('/login', async(req, res, next) => {
  req.body.from = 'company';
  const { emailPhone } = req.body;
  companyAuthLogger.debug(`login attempt,
    emailPhone: ${emailPhone}`);
  const { query, isPhone } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
  const foundUser = await companyMain.findOne({ ...query, ... { verified: true } });
  if (!foundUser) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  req.body.isPhone = isPhone;
  req.body.foundUser = foundUser;
  return next();
}, checkIpAndAttempt, companyLoginRelegator); */


/* companyAuthRoutes.post('/signup', (req, res, next) => {
  const user = req.body;
  req.body.user = user;
  return next();
}, isTooCommonPhrase, isInAdictionaryOnline, signupFactorRelgator, (req, res) => {
  return res.status(401).send({ success: false, msg: 'unauthourised' });
}); */

/* companyAuthRoutes.post('/recover', async(req, res, next) => {
  const emailPhone = req.body.emailPhone;
  const emailOrPhone = emailPhone === 'phone' ? 'phone' : 'email';
  let query;
  companyAuthLogger.debug(`recover,
    emailphone: ${emailPhone}, emailOrPhone: ${emailOrPhone}`);

  if (emailOrPhone === 'phone') {
    query = { phone: emailPhone };
  } else { query = { email: emailPhone }; }
  const foundCompany = await companyMain.findOne(query);
  req.body.foundUser = foundCompany;
  return next();
}, recoverAccountFactory); */

/* companyAuthRoutes.post('/confirm', async(req, res, next) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id, verifycode, how } = req.body;
  companyAuthLogger.debug(`verify, verifycode: ${verifycode}, how: ${how}`);
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
  const foundCompany = await companyMain.findById(_id);
  req.body.foundUser = foundCompany;
  return next();
}, confirmAccountFactory); */

/* companyAuthRoutes.put('/resetpaswd', async(req, res, next) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id, verifycode } = req.body;
  companyAuthLogger.debug(`resetpassword,
    verifycode: ${verifycode}`);
  const isValid = verifyObjectId(_id);
  if (!isValid) {
    return {
      status: 401,
      response: {
        success: false,
        err: 'unauthourised'
      }
    };
  }
  const foundCompany = await companyMain.findById(_id);
  req.body.foundUser = foundCompany;
  return next();
}, resetAccountFactory); */

companyAuthRoutes.post('/updateprofileimg/:companyIdParam', requireAuth, requireActiveCompany, uploadFiles, appendBody, saveMetaToDb, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  companyAuthLogger.debug('updateprofileimg');
  const foundCompany = await companyMain
    .findById(queryId);

  if (!foundCompany) {
    return res.status(401).send({
      success: false,
      err: 'Account does not exist'
    });
  }
  const parsed = req.body;

  if (parsed) {
    if (parsed.profilePic) {
      foundCompany.profilePic = parsed.profilePic || foundCompany.profilePic;
    }

    if (parsed.coverPic) {
      foundCompany.profileCoverPic = parsed.coverPic || foundCompany.profileCoverPic;
    }

    if (parsed.newPhotos) {
      const oldPhotos = foundCompany.photos || [];

      foundCompany.photos = [...oldPhotos, ...parsed.newPhotos] as string[];
    }
  }

  let status = 200;
  let response: Iauthresponse = { success: true };

  const updated = await foundCompany.save().catch((err) => {
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

  if (updated) {
    addParentToLocals(res, queryId, companyMain.collection.collectionName, 'trackDataDelete');
  }

  return res.status(status).send(response);
});

companyAuthRoutes.put('/blockunblock/:companyIdParam', requireAuth, requireSuperAdmin, async(req, res) => {
  companyAuthLogger.debug('blockunblock');
  const { companyIdParam } = req.params;
  const isValid = verifyObjectId(companyIdParam);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const foundCompany = await companyMain
    .findById(companyIdParam);

  if (!foundCompany) {
    return res.status(401).send({
      success: false,
      err: 'Account does not exist'
    });
  }
  foundCompany.blocked = req.body.blocked;

  let status = 200;
  let response: Iauthresponse = { success: true };

  await foundCompany.save().catch(err => {
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

companyAuthRoutes.post('/addcompany', requireAuth, requireSuperAdmin, addUser, addCompany);

companyAuthRoutes.post('/addcompanyimg/:companyIdParam', requireAuth, requireSuperAdmin, uploadFiles, appendBody, saveMetaToDb, addUser, addCompany);

companyAuthRoutes.get('/getonecompany/:urId/:companyIdParam', requireAuth, requireSuperAdmin, async(req, res) => {
  const { companyIdParam } = req.params;
  const isValid = verifyObjectId(companyIdParam);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const oneCompany = await companyLean
    .findById(companyIdParam)
    .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()])
    .lean();

  if (!oneCompany) {
    return res.status(200).send({});
  }

  addParentToLocals(res, oneCompany._id, companyMain.collection.collectionName, 'trackDataView');

  return res.status(200).send(oneCompany);
});

companyAuthRoutes.get('/getcompanys/:offset/:limit/:companyIdParam', requireAuth, requireSuperAdmin, async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const currOffset = offset === 0 ? 0 : offset;
  const currLimit = limit === 0 ? 1000 : limit;

  const all = await Promise.all([
    companyLean
      .find({ })
      .sort({ createdAt: 1 })
      .limit(Number(currLimit))
      .skip(Number(currOffset))
      .populate([populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()])
      .lean(),
    companyLean.countDocuments()
  ]);
  const filteredFaqs = all[0].filter(data => !data.blocked);
  const response: IdataArrayResponse = {
    count: all[1],
    data: filteredFaqs
  };

  for (const val of filteredFaqs) {
    addParentToLocals(res, val._id, companyMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(response);
});

// db.users.updateOne({ _id: ObjectId('6641c3d122dfefc4809ebe66') }, { $set: { email: "pollarbrian@gmail.com" } })

// db.users.updateOne({ _id: ObjectId('6641c3d122dfefc4809ebe66') }, { $set: { companyId: "6641c3d122dfefc4809ebe5f" } })

// db.companysubscriptions.updateOne({ _id: ObjectId('6641c3d122dfefc4809ebe62') }, { $set: { companyId: "6641c3d122dfefc4809ebe5f" } })

companyAuthRoutes.put('/updatecompanybulk/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'update'), updateUserBulk, updateCompany);

companyAuthRoutes.post('/updatecompanybulkimg/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'update'), uploadFiles, appendBody, saveMetaToDb, updateUserBulk, updateCompany);

/* companyAuthRoutes.put('/deletemany/:companyIdParam', requireAuth, requireSuperAdmin, async(req, res) => {
  const { ids } = req.body;
  const isValid = verifyObjectIds([...ids]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await companyMain
    .deleteMany({ _id: { $in: ids } }).catch(err => {
      companyAuthLogger.error('deletemany users failed with error: ' + err.message);
      return null;
    });

  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
}); */


/* companyAuthRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), deleteFiles, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await companyMain
    .findByIdAndDelete(queryId);
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
}); */

companyAuthRoutes.put('/deleteimages/:companyIdParam', requireAuth, requireActiveCompany, deleteFiles(true), async(req, res) => {
  const filesWithDir: IfileMeta[] = req.body.filesWithDir;
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;

  if (filesWithDir && !filesWithDir.length) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const isValid = verifyObjectId(queryId);

  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const company = await companyMain
    .findOne({ _id: queryId })
    .lean();

  if (!company) {
    return res.status(404).send({ success: false, err: 'item not found' });
  }
  const photos = company.photos;
  const filesWithDirIds = filesWithDir
    .map(val => val._id);
  let errResponse: Isuccess;

  await companyMain.updateOne({
    _id: queryId
  }, {
    $set: {
      photos: photos
        .filter((p: string) => !filesWithDirIds.includes(p)) as string[],
      profilePic: company.photos.find(p => p === company.profilePic),
      profileCoverPic: company.photos.find(p => p === company.profileCoverPic)
    }
  }).catch(err => {
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

  addParentToLocals(res, queryId, companyMain.collection.collectionName, 'makeTrackEdit');

  return res.status(200).send({ success: true });
});


