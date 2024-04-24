import { appendBody, deleteFiles, fileMetaLean, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { companyLean, companyMain } from '../models/company.model';
import { user } from '../models/user.model';
import { requireActiveCompany } from './company-auth';
import { requireSuperAdmin } from './superadmin.routes';
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
};*/
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
});*/
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
}, checkIpAndAttempt, companyLoginRelegator);*/
/* companyAuthRoutes.post('/signup', (req, res, next) => {
  const user = req.body;
  req.body.user = user;
  return next();
}, isTooCommonPhrase, isInAdictionaryOnline, signupFactorRelgator, (req, res) => {
  return res.status(401).send({ success: false, msg: 'unauthourised' });
});*/
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
}, recoverAccountFactory);*/
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
}, confirmAccountFactory);*/
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
}, resetAccountFactory);*/
companyAuthRoutes.post('/updateprofileimg/:companyIdParam', requireAuth, requireActiveCompany, uploadFiles, appendBody, saveMetaToDb, async (req, res) => {
    const { companyId } = req.user;
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
            foundCompany.photos = oldPhotos.concat(parsed.newFiles);
        }
    }
    let status = 200;
    let response = { success: true };
    await foundCompany.save().catch((err) => {
        status = 403;
        const errResponse = {
            success: false
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    return res.status(status).send(response);
});
companyAuthRoutes.put('/blockunblock/:companyIdParam', requireAuth, requireSuperAdmin, async (req, res) => {
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
    let response = { success: true };
    await foundCompany.save().catch(err => {
        status = 403;
        const errResponse = {
            success: false
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    return res.status(status).send(response);
});
companyAuthRoutes.post('/addcompany', requireAuth, requireSuperAdmin, async (req, res) => {
    const companyData = req.body.company;
    const userData = req.body.user;
    const countCompany = await companyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    companyData.urId = makeUrId(Number(countCompany[0]?.urId || '0'));
    const newCompany = new companyMain(companyData);
    let status = 200;
    let response = { success: true };
    const savedCompany = await newCompany.save().catch((err) => {
        status = 403;
        const errResponse = {
            success: false
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    if (!response.err && savedCompany) {
        // const type = 'link';
        response = {
            success: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: savedCompany._id
        };
        /* await sendTokenEmail(
          savedCompany, type, stockAuthConfig.localSettings.appOfficialName);*/
    }
    else {
        return res.status(status).send(response);
    }
    const countUser = await user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    userData.urId = makeUrId(Number(countUser[0]?.urId || '0'));
    userData.companyId = savedCompany._id;
    const newUser = new user(userData);
    const savedUser = await newUser.save().catch((err) => {
        status = 403;
        const errResponse = {
            success: false
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    if (!response.err && savedUser) {
        savedCompany.owner = savedUser._id;
        await savedCompany.save();
        response = {
            success: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: savedCompany._id
        };
    }
    return res.status(status).send(response);
});
companyAuthRoutes.post('/addcompanyimg/:companyIdParam', requireAuth, requireSuperAdmin, uploadFiles, appendBody, saveMetaToDb, async (req, res) => {
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
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    companyData.urId = makeUrId(Number(count[0]?.urId || '0'));
    const newCompany = new companyMain(companyData);
    let status = 200;
    let response = { success: true };
    const savedCompany = await newCompany.save().catch((err) => {
        status = 403;
        const errResponse = {
            success: false
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
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
companyAuthRoutes.get('/getonecompany/:urId/:companyIdParam', requireAuth, requireSuperAdmin, async (req, res) => {
    const { companyIdParam } = req.params;
    const isValid = verifyObjectId(companyIdParam);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const oneCompany = await companyLean
        .findById(companyIdParam)
        .populate({ path: 'profilePic', model: fileMetaLean })
        .populate({ path: 'profileCoverPic', model: fileMetaLean })
        .populate({ path: 'photos', model: fileMetaLean })
        .lean();
    if (!oneCompany) {
        return res.status(200).send({});
    }
    return res.status(200).send(oneCompany);
});
companyAuthRoutes.get('/getcompanys/:offset/:limit/:companyIdParam', requireAuth, requireSuperAdmin, async (req, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;
    const all = await Promise.all([
        companyLean
            .find({})
            .sort({ createdAt: 1 })
            .limit(Number(currLimit))
            .skip(Number(currOffset))
            .populate({ path: 'profilePic', model: fileMetaLean })
            .populate({ path: 'profileCoverPic', model: fileMetaLean })
            .populate({ path: 'photos', model: fileMetaLean })
            .lean(),
        companyLean.countDocuments()
    ]);
    const filteredFaqs = all[0].filter(data => !data.blocked);
    const response = {
        count: all[1],
        data: filteredFaqs
    };
    console.log('response ISSSSSSS', response);
    return res.status(200).send(response);
});
companyAuthRoutes.put('/updatecompanybulk/:companyIdParam', requireAuth, requireSuperAdmin, async (req, res) => {
    const { companyIdParam } = req.params;
    const updatedCompany = req.body.company;
    const isValid = verifyObjectId(companyIdParam);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const foundCompany = await companyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(companyIdParam);
    if (!foundCompany) {
        return res.status(404).send({ success: false });
    }
    if (!foundCompany.urId) {
        const count = await companyMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find().sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundCompany.urId = makeUrId(Number(count[0]?.urId || '0'));
    }
    delete updatedCompany._id;
    const keys = Object.keys(updatedCompany);
    keys.forEach(key => {
        if (foundCompany[key] && key !== '_id' && key !== 'profilePic' && key !== 'profileCoverPic' && key !== 'photos') {
            foundCompany[key] = updatedCompany[key] || foundCompany[key];
        }
    });
    let status = 200;
    let response = { success: true };
    await foundCompany.save().catch((err) => {
        status = 403;
        const errResponse = {
            success: false
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    return res.status(status).send(response);
});
companyAuthRoutes.post('/updatecompanybulkimg/:companyIdParam', requireAuth, requireSuperAdmin, uploadFiles, appendBody, saveMetaToDb, async (req, res) => {
    const { companyIdParam } = req.params;
    const updatedCompany = req.body.user;
    const isValid = verifyObjectId(companyIdParam);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const foundCompany = await companyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ companyId: companyIdParam });
    if (!foundCompany) {
        return res.status(404).send({ success: false });
    }
    if (!foundCompany.urId) {
        const count = await companyMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({ companyId: companyIdParam }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
            foundCompany.photos = oldPhotos.concat(parsed.newFiles);
        }
    }
    delete updatedCompany._id;
    const keys = Object.keys(updatedCompany);
    keys.forEach(key => {
        if (foundCompany[key] && key !== '_id') {
            foundCompany[key] = updatedCompany[key] || foundCompany[key];
        }
    });
    const status = 200;
    let response = { success: true };
    await foundCompany.save().catch((err) => {
        const errResponse = {
            success: false
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    return res.status(status).send(response);
});
companyAuthRoutes.put('/deletemany/:companyIdParam', requireAuth, requireSuperAdmin, deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const isValid = verifyObjectIds([...ids]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await companyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } }).catch(err => {
        companyAuthLogger.error('deletemany users failed with error: ' + err.message);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
companyAuthRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), deleteFiles, async (req, res) => {
    const { companyId } = req.user;
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
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
companyAuthRoutes.put('/deleteimages/:companyIdParam', requireAuth, requireActiveCompany, deleteFiles, async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { companyId } = req.user;
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
        .filter((p) => !filesWithDirIds.includes(p));
    company.profilePic = company.photos.find(p => p === company.profilePic);
    company.profileCoverPic = company.photos.find(p => p === company.profileCoverPic);
    let errResponse;
    await company.save().catch(err => {
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
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=company.routes.js.map