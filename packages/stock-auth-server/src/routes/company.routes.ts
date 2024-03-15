/**
 * This file contains the authentication routes for the stock-auth-server package.
 * It exports the companyAuthRoutes router and companyLoginRelegator function.
 * It also imports various controllers and models from the same package and other packages.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Iauthresponse, Iauthtoken, Icompany, Icustomrequest, IfileMeta, Isuccess, Iuser } from '@open-stock/stock-universal';
import {
  appendBody,
  deleteFiles,
  fileMetaLean,
  makeUrId,
  requireAuth,
  roleAuthorisation,
  saveMetaToDb,
  stringifyMongooseErr,
  uploadFiles,
  verifyObjectId,
  verifyObjectIds
} from '@open-stock/stock-universal-server';
import express, { Request, Response } from 'express';
import { getLogger } from 'log4js';
import { checkIpAndAttempt, confirmAccountFactory, determineIfIsPhoneAndMakeFilterObj, isInAdictionaryOnline, isTooCommonPhrase, recoverAccountFactory, resetAccountFactory } from '../controllers/auth.controller';
import { generateToken, setUserInfo } from '../controllers/universial.controller';
import { companyLean, companyMain } from '../models/company.model';
import { userAuthSelect } from '../models/user.model';
import { stockAuthConfig } from '../stock-auth-local';
import { loginFactorRelgator } from './superadmin.routes';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
// const passport = require('passport');

/**
 * Router for company authentication routes.
 */
export const companyAuthRoutes = express.Router();

/**
 * Logger for company authentication routes.
 */
const companyAuthLogger = getLogger('routes/company');


/**
 * Handles the company login request.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the authentication token and user information.
 */
export const companyLoginRelegator = async(req: Request, res: Response) => {
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

  const permProp = {
    create: true,
    read: true,
    update: true,
    delete: true
  };

  const permissions = {
    orders: permProp,
    payments: permProp,
    users: permProp,
    items: permProp,
    faqs: permProp,
    videos: permProp,
    printables: permProp,
    buyer: permProp
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
  const nowResponse: Iauthresponse = {
    success: true,
    user: foundCompany as Iuser,
    token
  };
  return res.status(200).send(nowResponse);
};

companyAuthRoutes.get('/authexpress/:companyIdParam', requireAuth, async(req, res) => {
  const { userId, companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const foundCompany = await companyLean
    .findById(userId)
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

  const permProp = {
    create: true,
    read: true,
    update: true,
    delete: true
  };

  const permissions = {
    orders: permProp,
    payments: permProp,
    users: permProp,
    items: permProp,
    faqs: permProp,
    videos: permProp,
    printables: permProp,
    buyer: permProp
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
});

companyAuthRoutes.post('/login', (req, res, next) => {
  req.body.from = 'user';
  const { emailPhone } = req.body;
  companyAuthLogger.debug(`login attempt,
    emailPhone: ${emailPhone}`);
  return next();
}, checkIpAndAttempt, companyLoginRelegator);


companyAuthRoutes.post('/signup', (req, res, next) => {
  const user = req.body;
  req.body.user = user;
  return next();
}, isTooCommonPhrase, isInAdictionaryOnline, loginFactorRelgator, (req, res) => {
  return res.status(401).send({ success: false, msg: 'unauthourised' });
});

companyAuthRoutes.post('recover', async(req, res, next) => {
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
}, recoverAccountFactory);

companyAuthRoutes.post('/confirm', async(req, res, next) => {
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
}, confirmAccountFactory);

companyAuthRoutes.put('/resetpaswd', async(req, res, next) => {
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
}, resetAccountFactory);

companyAuthRoutes.post('/updateprofileimg/:companyIdParam', requireAuth, uploadFiles, appendBody, saveMetaToDb, async(req, res) => {
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
  const parsed = req.body.parsed;
  if (parsed) {
    if (parsed.profilePic) {
      foundCompany.profilePic = parsed.profilePic || foundCompany.profilePic;
    }

    if (parsed.coverPic) {
      foundCompany.profileCoverPic = parsed.coverPic || foundCompany.profileCoverPic;
    }

    if (parsed.newFiles) {
      const oldPhotos = foundCompany.photos;
      foundCompany.photos = oldPhotos.concat(parsed.newFiles) as string[];
    }
  }

  let status = 200;
  let response: Iauthresponse = { success: true };
  await foundCompany.save().catch((err) => {
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

companyAuthRoutes.put('/blockunblock/:companyIdParam', requireAuth, roleAuthorisation('users', 'update'), async(req, res) => {
  const { companyId } = (req as unknown as Icustomrequest).user;
  companyAuthLogger.debug('blockunblock');
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const foundCompany = await companyMain
    .findById(queryId);
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


companyAuthRoutes.post('/addcompany', requireAuth, roleAuthorisation('users', 'create'), uploadFiles, appendBody, saveMetaToDb, async(req, res) => {
  const companyData = req.body.company;
  const parsed = req.body.parsed;
  if (parsed) {
    if (parsed.profilePic) {
      companyData.profilePic = parsed.profilePic || companyData.profilePic;
    }

    if (parsed.coverPic) {
      companyData.profileCoverPic = parsed.coverPic || companyData.profileCoverPic;
    }

    if (parsed.newFiles) {
      const oldPhotos = companyData.photos;
      companyData.photos = oldPhotos.concat(parsed.newFiles);
    }
  }
  const count = await companyMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
  });
  if (!response.err && savedCompany) {
    const type = 'link';
    response = {
      success: true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: savedCompany._id
    };
    /* await sendTokenEmail(
      savedCompany, type, stockAuthConfig.localSettings.appOfficialName);*/
  }
  return res.status(status).send(response);
});

companyAuthRoutes.post('/addcompanyimg/:companyIdParam', requireAuth, roleAuthorisation('users', 'create'), uploadFiles, appendBody, saveMetaToDb, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  // const isValid = verifyObjectId(queryId);
  const companyData = req.body.company;
  const parsed = req.body.parsed;
  if (parsed) {
    if (parsed.profilePic) {
      companyData.profilePic = parsed.profilePic || companyData.profilePic;
    }

    if (parsed.coverPic) {
      companyData.profileCoverPic = parsed.coverPic || companyData.profileCoverPic;
    }

    if (parsed.newFiles) {
      const oldPhotos = companyData.photos;
      companyData.photos = oldPhotos.concat(parsed.newFiles);
    }
  }
  const count = await companyMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
  });
  if (!response.err && savedCompany) {
    response = {
      success: true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: savedCompany._id
    };
  }
  return res.status(status).send(response);
});

companyAuthRoutes.put('/updatecompanybulk/:companyIdParam', requireAuth, roleAuthorisation('items', 'update'), async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const updatedUser = req.body.user;
  const isValid = verifyObjectId(queryId);
  if (!isValid) {
    return res.status(401).send({ success: false, err: 'unauthourised' });
  }

  const foundCompany = await companyMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findByIdAndUpdate(queryId);
  if (!foundCompany) {
    return res.status(404).send({ success: false });
  }

  if (!foundCompany.urId) {
    const count = await companyMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    foundCompany.urId = makeUrId(Number(count[0]?.urId || '0'));
  }

  delete updatedUser._id;
  const keys = Object.keys(updatedUser);
  keys.forEach(key => {
    if (foundCompany[key] && key !== '_id' && key !== 'userId' && key !== 'profilePic' && key !== 'profileCoverPic' && key !== 'photos') {
      foundCompany[key] = updatedUser[key] || foundCompany[key];
    }
  });

  let status = 200;
  let response: Iauthresponse = { success: true };
  await foundCompany.save().catch((err) => {
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

companyAuthRoutes.post('/updatecompanybulkimg/:companyIdParam', requireAuth, roleAuthorisation('items', 'create'), uploadFiles, appendBody, saveMetaToDb, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params;
  const updatedUser = req.body.user;
  const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
  const isValid = verifyObjectId(companyId);
  if (!isValid) {
    return res.status(401).send({ success: false, err: 'unauthourised' });
  }
  const foundCompany = await companyMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOneAndUpdate({ companyId: queryId });
  if (!foundCompany) {
    return res.status(404).send({ success: false });
  }

  if (!foundCompany.urId) {
    const count = await companyMain
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    foundCompany.urId = makeUrId(Number(count[0]?.urId || '0'));
  }
  const parsed = req.body.parsed;
  if (parsed) {
    if (parsed.profilePic) {
      foundCompany.profilePic = parsed.profilePic || foundCompany.profilePic;
    }

    if (parsed.coverPic) {
      foundCompany.profileCoverPic = parsed.coverPic || foundCompany.profileCoverPic;
    }

    if (parsed.newFiles) {
      const oldPhotos = foundCompany.photos;
      foundCompany.photos = oldPhotos.concat(parsed.newFiles) as string[];
    }
  }
  delete updatedUser._id;

  const keys = Object.keys(updatedUser);
  keys.forEach(key => {
    if (foundCompany[key] && key !== '_id') {
      foundCompany[key] = updatedUser[key] || foundCompany[key];
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
});

/* companyAuthRoutes.put('/deletemany/:companyIdParam', requireAuth, roleAuthorisation('users'), deleteFiles, async(req, res) => {
  const { companyId } = (req as Icustomrequest).user;
  const { companyIdParam } = req.params
  const { ids } = req.body;
  const isValid = verifyObjectIds([...ids, ...[queryId]]);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }

  const deleted = await companyMain
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids }, companyId: queryId }).catch(err => {
      companyAuthLogger.error('deletemany users failed with error: ' + err.message)
    return null;
    });

    if (Boolean(deleted)) {
      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});*/

companyAuthRoutes.put('/deleteone/:companyIdParam', requireAuth, roleAuthorisation('users', 'delete'), deleteFiles, async(req, res) => {
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
});


companyAuthRoutes.put('/deleteimages/:companyIdParam', requireAuth, roleAuthorisation('items', 'delete'), deleteFiles, async(req, res) => {
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .findOneAndUpdate({ _id: queryId });
  if (!company) {
    return res.status(404).send({ success: false, err: 'item not found' });
  }
  const photos = company.photos;
  const filesWithDirIds = filesWithDir
    .map(val => val._id);
  company.photos = photos
    .filter((p: string) => !filesWithDirIds.includes(p)) as string[];
  company.profilePic = company.photos.find(p => p === company.profilePic);
  company.profileCoverPic = company.photos.find(p => p === company.profileCoverPic);
  let errResponse: Isuccess;
  await company.save().catch(err => {
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


