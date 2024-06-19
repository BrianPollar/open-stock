"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompany = exports.addCompany = exports.companyAuthRoutes = void 0;
const tslib_1 = require("tslib");
/**
 * This file contains the authentication routes for the stock-auth-server package.
 * It exports the companyAuthRoutes router and companyLoginRelegator function.
 * It also imports various controllers and models from the same package and other packages.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-misused-promises */
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const company_model_1 = require("../models/company.model");
const user_model_1 = require("../models/user.model");
const company_auth_1 = require("./company-auth");
const superadmin_routes_1 = require("./superadmin.routes");
const user_routes_1 = require("./user.routes");
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
// const passport = require('passport');
/**
 * Router for company authentication routes.
 */
exports.companyAuthRoutes = express_1.default.Router();
const addCompany = async (req, res) => {
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
    const count = await company_model_1.companyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    companyData.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newCompany = new company_model_1.companyMain(companyData);
    let status = 200;
    let response = { success: true };
    const savedCompany = await newCompany.save().catch((err) => {
        status = 403;
        const errResponse = {
            success: false
        };
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    if (!response.err && savedCompany) {
        const stn = {
            companyId: savedCompany._id,
            invoices: true,
            payments: true,
            orders: true,
            jobCards: true,
            users: true
        };
        await (0, stock_notif_server_1.createNotifStn)(stn);
        response = {
            success: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: savedCompany._id
        };
    }
    else {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        await user_model_1.user.deleteOne({ _id: savedUser._id });
    }
    return res.status(status).send(response);
};
exports.addCompany = addCompany;
const updateCompany = async (req, res) => {
    const { companyIdParam } = req.params;
    const updatedCompany = req.body.company;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const foundCompany = await company_model_1.companyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ companyId: companyIdParam });
    if (!foundCompany) {
        return res.status(404).send({ success: false });
    }
    if (!foundCompany.urId) {
        const count = await company_model_1.companyMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({ companyId: companyIdParam }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundCompany.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
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
            foundCompany.photos = [...oldPhotos, ...parsed.newPhotos];
        }
    }
    delete updatedCompany._id;
    const keys = Object.keys(updatedCompany);
    keys.forEach(key => {
        if (foundCompany[key] && key !== '_id' && key !== 'phone' && key !== 'email') {
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    return res.status(status).send(response);
};
exports.updateCompany = updateCompany;
/**
 * Logger for company authentication routes.
 */
const companyAuthLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
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
exports.companyAuthRoutes.post('/updateprofileimg/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    companyAuthLogger.debug('updateprofileimg');
    const foundCompany = await company_model_1.companyMain
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
            foundCompany.photos = [...oldPhotos, ...parsed.newPhotos];
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    return res.status(status).send(response);
});
exports.companyAuthRoutes.put('/blockunblock/:companyIdParam', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    companyAuthLogger.debug('blockunblock');
    const { companyIdParam } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundCompany = await company_model_1.companyMain
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        response = errResponse;
    });
    return res.status(status).send(response);
});
exports.companyAuthRoutes.post('/addcompany', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, user_routes_1.addUser, exports.addCompany);
exports.companyAuthRoutes.post('/addcompanyimg/:companyIdParam', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, user_routes_1.addUser, exports.addCompany);
exports.companyAuthRoutes.get('/getonecompany/:urId/:companyIdParam', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    const { companyIdParam } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyIdParam);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const oneCompany = await company_model_1.companyLean
        .findById(companyIdParam)
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
        .lean();
    if (!oneCompany) {
        return res.status(200).send({});
    }
    return res.status(200).send(oneCompany);
});
exports.companyAuthRoutes.get('/getcompanys/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;
    const all = await Promise.all([
        company_model_1.companyLean
            .find({})
            .sort({ createdAt: 1 })
            .limit(Number(currLimit))
            .skip(Number(currOffset))
            .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
            .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
            .lean(),
        company_model_1.companyLean.countDocuments()
    ]);
    const filteredFaqs = all[0].filter(data => !data.blocked);
    const response = {
        count: all[1],
        data: filteredFaqs
    };
    return res.status(200).send(response);
});
// db.users.updateOne({ _id: ObjectId('6641c3d122dfefc4809ebe66') }, { $set: { email: "pollarbrian@gmail.com" } })
// db.users.updateOne({ _id: ObjectId('6641c3d122dfefc4809ebe66') }, { $set: { companyId: "6641c3d122dfefc4809ebe5f" } })
// db.companysubscriptions.updateOne({ _id: ObjectId('6641c3d122dfefc4809ebe62') }, { $set: { companyId: "6641c3d122dfefc4809ebe5f" } })
exports.companyAuthRoutes.put('/updatecompanybulk/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), user_routes_1.updateUserBulk, exports.updateCompany);
exports.companyAuthRoutes.post('/updatecompanybulkimg/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, user_routes_1.updateUserBulk, exports.updateCompany);
/* companyAuthRoutes.put('/deletemany/:companyIdParam', requireAuth, requireSuperAdmin, async(req, res) => {
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
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
  }
});*/
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
});*/
exports.companyAuthRoutes.put('/deleteimages/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, stock_universal_server_1.deleteFiles, async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const company = await company_model_1.companyMain
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
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
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