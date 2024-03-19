"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoginRelegator = exports.authRoutes = void 0;
const tslib_1 = require("tslib");
/**
 * This file contains the authentication routes for the stock-auth-server package.
 * It exports the authRoutes router and userLoginRelegator function.
 * It also imports various controllers and models from the same package and other packages.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-misused-promises */
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
const passport = require('passport');
/**
 * Router for authentication routes.
 */
exports.authRoutes = express_1.default.Router();
const authLogger = (0, log4js_1.getLogger)('routes/user');
/**
 * Handles the user login request.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the user information and token.
 */
const userLoginRelegator = async (req, res) => {
    const { emailPhone } = req.body;
    const { query } = (0, stock_auth_server_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    const foundUser = await stock_auth_server_1.userLean
        .findOne({ ...query, ...{ verified: true } })
        .lean()
        .select(stock_auth_server_1.userAuthSelect)
        .catch(err => {
        authLogger.error('Find user projection err', err);
        return null;
    });
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const company = await stock_auth_server_1.companyLean.findById(foundUser.companyId).lean().select({ blocked: 1, _id: 1 });
    // delete user.password; //we do not want to send back password
    const userInfo = (0, stock_auth_server_1.setUserInfo)(foundUser._id, foundUser.permissions, foundUser.companyId, { active: !company.blocked });
    const token = (0, stock_auth_server_1.generateToken)(userInfo, '1d', (0, stock_auth_server_1.getStockAuthConfig)().authSecrets.jwtSecret);
    const nowResponse = {
        success: true,
        user: foundUser,
        token
    };
    return res.status(200).send(nowResponse);
};
exports.userLoginRelegator = userLoginRelegator;
exports.authRoutes.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
exports.authRoutes.get('/authexpress/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await stock_auth_server_1.userLean
        .findById(userId)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        .lean()
        .select(stock_auth_server_1.userAuthSelect)
        .catch(err => {
        authLogger.error('Find user projection err', err);
        // return false;
    });
    if (!foundUser) {
        const response = {
            success: false,
            err: 'Acccount does not exist!'
        };
        return res.status(401).send(response);
    }
    if (foundUser.blocked.status === true) {
        const response = {
            success: false,
            err: `This Acccount has been blocked
                due to suspicious activities please contact,
                support`
        };
        return res.status(401).send(response);
    }
    const company = await stock_auth_server_1.companyLean
        .findById(foundUser.companyId)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .lean().select({ blocked: 1, _id: 1 });
    const userInfo = (0, stock_auth_server_1.setUserInfo)(foundUser._id, foundUser.permissions, foundUser.companyId, { active: !company.blocked });
    const token = (0, stock_auth_server_1.generateToken)(userInfo, '1d', (0, stock_auth_server_1.getStockAuthConfig)().authSecrets.jwtSecret);
    const nowResponse = {
        success: true,
        user: foundUser,
        token
    };
    return res.status(200).send(nowResponse);
});
exports.authRoutes.post('/login', (req, res, next) => {
    req.body.from = 'user';
    const { emailPhone } = req.body;
    authLogger.debug(`login attempt,
    emailPhone: ${emailPhone}`);
    return next();
}, stock_auth_server_1.checkIpAndAttempt, exports.userLoginRelegator);
exports.authRoutes.post('/signup', (req, res, next) => {
    const user = req.body;
    req.body.user = user;
    return next();
}, stock_auth_server_1.isTooCommonPhrase, stock_auth_server_1.isInAdictionaryOnline, stock_auth_server_1.loginFactorRelgator, (req, res) => {
    return res.status(401).send({ success: false, msg: 'unauthourised' });
});
exports.authRoutes.post('recover', async (req, res, next) => {
    const emailPhone = req.body.emailPhone;
    const emailOrPhone = emailPhone === 'phone' ? 'phone' : 'email';
    let query;
    authLogger.debug(`recover, 
    emailphone: ${emailPhone}, emailOrPhone: ${emailOrPhone}`);
    if (emailOrPhone === 'phone') {
        query = { phone: emailPhone };
    }
    else {
        query = { email: emailPhone };
    }
    const foundUser = await stock_auth_server_1.user.findOne(query);
    req.body.foundUser = foundUser;
    return next();
}, stock_auth_server_1.recoverAccountFactory);
exports.authRoutes.post('/confirm', async (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, verifycode, how } = req.body;
    authLogger.debug(`verify, verifycode: ${verifycode}, how: ${how}`);
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
    const foundUser = await stock_auth_server_1.user.findById(_id);
    req.body.foundUser = foundUser;
    return next();
}, stock_auth_server_1.confirmAccountFactory);
exports.authRoutes.put('/resetpaswd', async (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, verifycode } = req.body;
    authLogger.debug(`resetpassword, 
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
    const foundUser = await stock_auth_server_1.user.findById(_id);
    req.body.foundUser = foundUser;
    return next();
}, stock_auth_server_1.resetAccountFactory);
exports.authRoutes.post('/manuallyverify/:userId/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), async (req, res) => {
    const { userId, companyId } = req.params;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!(0, stock_auth_server_1.getStockAuthConfig)() || !(0, stock_auth_server_1.getStockAuthConfig)().localSettings || (0, stock_auth_server_1.getStockAuthConfig)().localSettings.production) {
        return res.status(401).send({ success: false, er: 'unauthourized' });
    }
    const foundUser = await stock_auth_server_1.user
        .findByIdAndUpdate(userId);
    if (!foundUser) {
        return res.status(401).send({
            success: false,
            err: 'Account does not exist'
        });
    }
    foundUser.verified = true;
    return res.status(200).send({ success: true });
});
exports.authRoutes.post('/sociallogin', async (req, res) => {
    const credentials = req.body;
    authLogger.debug(`sociallogin, 
    socialId: ${credentials.socialId}`);
    const foundUser = await stock_auth_server_1.user.findOne({
        fromsocial: true,
        socialframework: credentials.type,
        socialId: credentials.socialId
    });
    if (!foundUser) {
        const count = await stock_auth_server_1.user
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        const urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
        const newUser = new stock_auth_server_1.user({
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
        let errResponse;
        const nUser = await newUser.save().catch(err => {
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
            return err;
        });
        if (errResponse) {
            return res.status(403).send(errResponse);
        }
        else {
            return res.status(200).send({
                success: true,
                user: nUser.toAuthJSON()
            });
        }
    }
    else {
        foundUser.fname = credentials.name;
        const file = {
            url: credentials.profilepic
        };
        foundUser.profilePic = file;
        let status = 200;
        let response = { success: true };
        const foundUserSaved = await foundUser.save().catch(err => {
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
            return err;
        });
        if (status === 200) {
            response = {
                success: true,
                user: foundUserSaved.toAuthJSON()
            };
            return res.status(200).send(response);
        }
        else {
            return res.status(403).send(response);
        }
    }
});
exports.authRoutes.put('/updateprofile/:formtype/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const { userdetails } = req.body;
    const { formtype } = req.params;
    let users;
    let success = true;
    let error;
    let status = 200;
    authLogger.debug(`updateprofile, 
    formtype: ${formtype}`);
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await stock_auth_server_1.user
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
            foundUser['comparePassword'](userdetails.passwd, function (err, isMatch) {
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
            }*/
            users = await stock_auth_server_1.user
                .find({ phone: foundUser.phone });
            if (users) {
                status = 401;
                success = false;
                error = `phone number is in use
          by another Account`;
            }
            else {
                foundUser.phone = userdetails.phone;
            }
            break;
        case 'email':
            // compare password
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            foundUser['comparePassword'](userdetails.passwd, function (err, isMatch) {
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
            }*/
            users = await stock_auth_server_1.user
                .find({ email: foundUser.email });
            if (users) {
                status = 200;
                success = false;
                error = `email address is in use by
          another Account`;
            }
            else {
                foundUser.email = userdetails.email;
            }
            break;
        case 'password':
            // compare password
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            foundUser['comparePassword'](userdetails.oldPassword, function (err, isMatch) {
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
            }*/
            break;
    }
    let response = { success: true, err: error };
    if (success === true) {
        await foundUser.save().catch((err) => {
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
    }
    return res.status(status).send(response);
});
exports.authRoutes.post('/updateprofileimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    let userId = req.body.user?._id;
    if (!userId) {
        userId = req.user.userId;
    }
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    authLogger.debug('updateprofileimg');
    const foundUser = await stock_auth_server_1.user
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
        if (parsed.newFiles) {
            const oldPhotos = foundUser.photos;
            foundUser.photos = oldPhotos.concat(parsed.newFiles);
        }
    }
    let status = 200;
    let response = { success: true };
    await foundUser.save().catch((err) => {
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
exports.authRoutes.put('/updatepermissions/:userId/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), async (req, res) => {
    const { userId } = req.params;
    // const { companyId } = (req as Icustomrequest).user;
    // const { companyIdParam } = req.params;
    authLogger.debug('updatepermissions');
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await stock_auth_server_1.user
        .findById(userId);
    if (!foundUser) {
        return res.status(401).send({
            success: false,
            err: 'Account does not exist'
        });
    }
    foundUser.permissions = req.body.permissions || foundUser.permissions;
    let status = 200;
    let response = { success: true };
    await foundUser.save().catch(err => {
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
exports.authRoutes.put('/blockunblock/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), async (req, res) => {
    const { userId } = req.user;
    // const { companyId } = (req as Icustomrequest).user;
    // const { companyIdParam } = req.params;
    authLogger.debug('blockunblock');
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await stock_auth_server_1.user
        .findById(userId);
    if (!foundUser) {
        return res.status(401).send({
            success: false,
            err: 'Account does not exist'
        });
    }
    foundUser.blocked = req.body.blocked;
    let status = 200;
    let response = { success: true };
    await foundUser.save().catch(err => {
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
exports.authRoutes.put('/addupdateaddr/:userId/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    authLogger.debug('updatepermissions');
    const foundUser = await stock_auth_server_1.user
        .findOneAndUpdate({ userId, companyId: queryId });
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
        }
        else {
            foundUser.address.push(address);
        }
    }
    else if (how === 'update') {
        let found;
        if (type === 'billing') {
            found = foundUser.billing.find(val => val.id === address.id);
        }
        else {
            found = foundUser.address.find(val => val.id === address.id);
        }
        if (found) {
            found = address;
        }
    }
    else if (type === 'billing') {
        foundUser.billing = foundUser.billing.filter(val => val.id !== address.id);
    }
    else {
        foundUser.address = foundUser.address.filter(val => val.id !== address.id);
    }
    let status = 200;
    let response = { success: true };
    await foundUser.save().catch(err => {
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
exports.authRoutes.get('/getoneuser/:urId/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    let filter = { urId };
    if (isValid) {
        filter = { urId, companyId: queryId };
    }
    const oneUser = await stock_auth_server_1.userLean
        .findOne(filter)
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, transform: (doc) => (doc.blocked ? null : doc) })
        .lean();
    if (!oneUser.companyId) {
        return res.status(200).send({});
    }
    return res.status(200).send(oneUser);
});
exports.authRoutes.get('/getusers/:where/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { companyId } = req.user;
    // const { companyIdParam } = req.params;
    const { where } = req.params;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;
    let filter;
    switch (where) {
        case 'manual':
            filter = {
                manuallyAdded: true,
                companyId
            };
            break;
        case 'auto':
            filter = {
                manuallyAdded: false,
                companyId
            };
            break;
        default:
            filter = { companyId };
            break;
    }
    const faqs = await stock_auth_server_1.userLean
        .find(filter)
        .sort({ firstName: 1 })
        .limit(Number(currLimit))
        .skip(Number(currOffset))
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'companyId', model: stock_auth_server_1.companyLean, select: { name: 1, blocked: 1 } })
        .lean();
    const filteredFaqs = faqs.filter(data => !data.companyId.blocked);
    return res.status(200).send(filteredFaqs);
});
exports.authRoutes.post('/adduser/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), async (req, res) => {
    const userData = req.body.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const count = await stock_auth_server_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    userData.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newUser = new stock_auth_server_1.user(userData);
    let status = 200;
    let response = { success: true };
    const savedUser = await newUser.save().catch((err) => {
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
    if (!response.err && savedUser) {
        const type = 'link';
        response = {
            success: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: savedUser._id
        };
        await (0, stock_auth_server_1.sendTokenEmail)(savedUser, type, (0, stock_auth_server_1.getStockAuthConfig)().localSettings.appOfficialName);
    }
    return res.status(status).send(response);
});
exports.authRoutes.post('/adduserimg/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const userData = req.body.user;
    const parsed = req.body.parsed;
    const { companyIdParam } = req.params;
    const { companyId } = req.user;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (parsed) {
        if (parsed.profilePic) {
            userData.profilePic = parsed.profilePic || userData.profilePic;
        }
        if (parsed.coverPic) {
            userData.profileCoverPic = parsed.coverPic || userData.profileCoverPic;
        }
        if (parsed.newFiles) {
            const oldPhotos = userData.photos;
            userData.photos = oldPhotos.concat(parsed.newFiles);
        }
    }
    const count = await stock_auth_server_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    userData.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newUser = new stock_auth_server_1.user(userData);
    let status = 200;
    let response = { success: true };
    const savedUser = await newUser.save().catch((err) => {
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
    if (!response.err && savedUser) {
        response = {
            success: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: savedUser._id
        };
    }
    return res.status(status).send(response);
});
exports.authRoutes.put('/updateuserbulk/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), async (req, res) => {
    const updatedUser = req.body.user;
    const { companyIdParam } = req.params;
    const { companyId } = req.user;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedUser;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const foundUser = await stock_auth_server_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!foundUser) {
        return res.status(404).send({ success: false });
    }
    if (!foundUser.urId) {
        const count = await stock_auth_server_1.user
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundUser.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    }
    delete updatedUser._id;
    const keys = Object.keys(updatedUser);
    keys.forEach(key => {
        if (foundUser[key]) {
            foundUser[key] = updatedUser[key] || foundUser[key];
        }
    });
    let status = 200;
    let response = { success: true };
    await foundUser.save().catch((err) => {
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
exports.authRoutes.post('/updateuserbulkimg/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    const updatedUser = req.body.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedUser;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const foundUser = await stock_auth_server_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!foundUser) {
        return res.status(404).send({ success: false });
    }
    if (!foundUser.urId) {
        const count = await stock_auth_server_1.user
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundUser.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    }
    const parsed = req.body.parsed;
    if (parsed) {
        if (parsed.profilePic) {
            foundUser.profilePic = parsed.profilePic || foundUser.profilePic;
        }
        if (parsed.coverPic) {
            foundUser.profileCoverPic = parsed.coverPic || foundUser.profileCoverPic;
        }
        if (parsed.newFiles) {
            const oldPhotos = foundUser.photos;
            foundUser.photos = oldPhotos.concat(parsed.newFiles);
        }
    }
    delete updatedUser._id;
    const keys = Object.keys(updatedUser);
    keys.forEach(key => {
        if (foundUser[key]) {
            foundUser[key] = updatedUser[key] || foundUser[key];
        }
    });
    const status = 200;
    let response = { success: true };
    await foundUser.save().catch((err) => {
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
exports.authRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await stock_auth_server_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids } }).catch(err => {
        authLogger.error('deletemany users failed with error: ' + err.message);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
exports.authRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await stock_auth_server_1.user
        .findByIdAndDelete(_id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.authRoutes.put('/deleteimages/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedUser = req.body.item;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedUser;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await stock_auth_server_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!foundUser) {
        return res.status(404).send({ success: false, err: 'item not found' });
    }
    const photos = foundUser.photos;
    const filesWithDirIds = filesWithDir
        .map(val => val._id);
    foundUser.photos = photos
        .filter((p) => !filesWithDirIds.includes(p));
    foundUser.profilePic = foundUser.photos.find(p => p === foundUser.profilePic);
    foundUser.profileCoverPic = foundUser.photos.find(p => p === foundUser.profileCoverPic);
    let errResponse;
    await foundUser.save().catch(err => {
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
//# sourceMappingURL=user.routes.js.map