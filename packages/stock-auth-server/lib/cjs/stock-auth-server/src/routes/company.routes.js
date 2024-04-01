"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyLoginRelegator = exports.companyAuthRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const auth_controller_1 = require("../controllers/auth.controller");
const universial_controller_1 = require("../controllers/universial.controller");
const company_model_1 = require("../models/company.model");
const user_model_1 = require("../models/user.model");
const stock_auth_local_1 = require("../stock-auth-local");
const superadmin_routes_1 = require("./superadmin.routes");
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
// const passport = require('passport');
/**
 * Router for company authentication routes.
 */
exports.companyAuthRoutes = express_1.default.Router();
/**
 * Logger for company authentication routes.
 */
const companyAuthLogger = (0, log4js_1.getLogger)('routes/company');
/**
 * Handles the company login request.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the authentication token and user information.
 */
const companyLoginRelegator = async (req, res) => {
    const { emailPhone } = req.body;
    const { query } = (0, auth_controller_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    const foundCompany = await company_model_1.companyLean
        .findOne({ ...query, ...{ verified: true } })
        .lean()
        .select(user_model_1.userAuthSelect)
        .catch(err => {
        companyAuthLogger.error('Find user projection err', err);
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
    const userInfo = (0, universial_controller_1.setUserInfo)(foundCompany._id, // 'admin',
    permissions, foundCompany._id, {
        active: !foundCompany.blocked
    });
    const token = (0, universial_controller_1.generateToken)(userInfo, '1d', stock_auth_local_1.stockAuthConfig.authSecrets.jwtSecret);
    const nowResponse = {
        success: true,
        user: foundCompany,
        token
    };
    return res.status(200).send(nowResponse);
};
exports.companyLoginRelegator = companyLoginRelegator;
exports.companyAuthRoutes.get('/authexpress/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId, companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundCompany = await company_model_1.companyLean
        .findById(userId)
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
        .lean()
        .select(user_model_1.userAuthSelect)
        .catch(err => {
        companyAuthLogger.error('Find user projection err', err);
        // return false;
    });
    if (!foundCompany) {
        const response = {
            success: false,
            err: 'Acccount does not exist!'
        };
        return res.status(401).send(response);
    }
    if (foundCompany.blocked === true) {
        const response = {
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
    const userInfo = (0, universial_controller_1.setUserInfo)('admin', permissions, foundCompany._id, {
        active: !foundCompany.blocked
    });
    const token = (0, universial_controller_1.generateToken)(userInfo, '1d', stock_auth_local_1.stockAuthConfig.authSecrets.jwtSecret);
    const nowResponse = {
        success: true,
        user: foundCompany,
        token
    };
    return res.status(200).send(nowResponse);
});
exports.companyAuthRoutes.post('/login', (req, res, next) => {
    req.body.from = 'user';
    const { emailPhone } = req.body;
    companyAuthLogger.debug(`login attempt,
    emailPhone: ${emailPhone}`);
    return next();
}, auth_controller_1.checkIpAndAttempt, exports.companyLoginRelegator);
exports.companyAuthRoutes.post('/signup', (req, res, next) => {
    const user = req.body;
    req.body.user = user;
    return next();
}, auth_controller_1.isTooCommonPhrase, auth_controller_1.isInAdictionaryOnline, superadmin_routes_1.loginFactorRelgator, (req, res) => {
    return res.status(401).send({ success: false, msg: 'unauthourised' });
});
exports.companyAuthRoutes.post('/recover', async (req, res, next) => {
    const emailPhone = req.body.emailPhone;
    const emailOrPhone = emailPhone === 'phone' ? 'phone' : 'email';
    let query;
    companyAuthLogger.debug(`recover, 
    emailphone: ${emailPhone}, emailOrPhone: ${emailOrPhone}`);
    if (emailOrPhone === 'phone') {
        query = { phone: emailPhone };
    }
    else {
        query = { email: emailPhone };
    }
    const foundCompany = await company_model_1.companyMain.findOne(query);
    req.body.foundUser = foundCompany;
    return next();
}, auth_controller_1.recoverAccountFactory);
exports.companyAuthRoutes.post('/confirm', async (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, verifycode, how } = req.body;
    companyAuthLogger.debug(`verify, verifycode: ${verifycode}, how: ${how}`);
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
    if (!isValid) {
        return {
            status: 401,
            response: {
                success: false,
                err: 'unauthourised'
            }
        };
    }
    const foundCompany = await company_model_1.companyMain.findById(_id);
    req.body.foundUser = foundCompany;
    return next();
}, auth_controller_1.confirmAccountFactory);
exports.companyAuthRoutes.put('/resetpaswd', async (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, verifycode } = req.body;
    companyAuthLogger.debug(`resetpassword, 
    verifycode: ${verifycode}`);
    const isValid = (0, stock_universal_server_1.verifyObjectId)(_id);
    if (!isValid) {
        return {
            status: 401,
            response: {
                success: false,
                err: 'unauthourised'
            }
        };
    }
    const foundCompany = await company_model_1.companyMain.findById(_id);
    req.body.foundUser = foundCompany;
    return next();
}, auth_controller_1.resetAccountFactory);
exports.companyAuthRoutes.post('/updateprofileimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
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
exports.companyAuthRoutes.put('/blockunblock/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), async (req, res) => {
    const { companyId } = req.user;
    companyAuthLogger.debug('blockunblock');
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundCompany = await company_model_1.companyMain
        .findById(queryId);
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
exports.companyAuthRoutes.post('/addcompany', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
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
exports.companyAuthRoutes.post('/addcompanyimg/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
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
    const count = await company_model_1.companyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
        response = {
            success: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: savedCompany._id
        };
    }
    return res.status(status).send(response);
});
exports.companyAuthRoutes.get('/getonecompany/:urId/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const oneUser = await company_model_1.companyLean
        .findOne({ urId, queryId })
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
        .lean();
    if (!oneUser.companyId) {
        return res.status(200).send({});
    }
    return res.status(200).send(oneUser);
});
exports.companyAuthRoutes.get('/getcompanys/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;
    const all = await Promise.all([
        company_model_1.companyLean
            .find({ companyId: queryId })
            .sort({ firstName: 1 })
            .limit(Number(currLimit))
            .skip(Number(currOffset))
            .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
            .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
            .lean(),
        company_model_1.companyLean.countDocuments({ companyId: queryId })
    ]);
    const filteredFaqs = all[0].filter(data => !data.blocked);
    const response = {
        count: all[1],
        data: filteredFaqs
    };
    return res.status(200).send(response);
});
exports.companyAuthRoutes.put('/updatecompanybulk/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'update'), async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const updatedUser = req.body.user;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const foundCompany = await company_model_1.companyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(queryId);
    if (!foundCompany) {
        return res.status(404).send({ success: false });
    }
    if (!foundCompany.urId) {
        const count = await company_model_1.companyMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundCompany.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    }
    delete updatedUser._id;
    const keys = Object.keys(updatedUser);
    keys.forEach(key => {
        if (foundCompany[key] && key !== '_id' && key !== 'userId' && key !== 'profilePic' && key !== 'profileCoverPic' && key !== 'photos') {
            foundCompany[key] = updatedUser[key] || foundCompany[key];
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
exports.companyAuthRoutes.post('/updatecompanybulkimg/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const updatedUser = req.body.user;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(companyId);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const foundCompany = await company_model_1.companyMain
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ companyId: queryId });
    if (!foundCompany) {
        return res.status(404).send({ success: false });
    }
    if (!foundCompany.urId) {
        const count = await company_model_1.companyMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundCompany.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
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
    delete updatedUser._id;
    const keys = Object.keys(updatedUser);
    keys.forEach(key => {
        if (foundCompany[key] && key !== '_id') {
            foundCompany[key] = updatedUser[key] || foundCompany[key];
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
exports.companyAuthRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await company_model_1.companyMain
        .findByIdAndDelete(queryId);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.companyAuthRoutes.put('/deleteimages/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('items', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
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