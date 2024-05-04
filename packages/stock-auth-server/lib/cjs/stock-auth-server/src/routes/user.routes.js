"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserBulk = exports.addUser = exports.userLoginRelegator = exports.signupFactorRelgator = exports.userAuthRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const tracer = tslib_1.__importStar(require("tracer"));
const auth_controller_1 = require("../controllers/auth.controller");
const universial_controller_1 = require("../controllers/universial.controller");
const company_model_1 = require("../models/company.model");
const company_subscription_model_1 = require("../models/subscriptions/company-subscription.model");
const user_model_1 = require("../models/user.model");
const stock_auth_local_1 = require("../stock-auth-local");
const company_auth_1 = require("./company-auth");
const company_subscription_routes_1 = require("./subscriptions/company-subscription.routes");
const superadmin_routes_1 = require("./superadmin.routes");
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
const passport = require('passport');
/**
 * Router for authentication routes.
 */
exports.userAuthRoutes = express_1.default.Router();
/**
 * Logger for authentication routes.
 */
const authLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = './openstockLog/';
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    throw err;
                }
            }
        });
        fs.appendFile('./openStockLog/auth-server.log', data.rawoutput + '\n', err => {
            if (err) {
                throw err;
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
const signupFactorRelgator = async (req, res, next) => {
    let foundUser = req.body.foundUser;
    if (!foundUser) {
        if (!foundUser.password || !foundUser.verified) {
            req.body.foundUser = foundUser;
            return next();
        }
        else {
            return res.status(402).send({ success: false, msg: 'unauthorised' });
        }
    }
    const { emailPhone } = req.body;
    const userType = req.body.userType || 'eUser';
    const passwd = req.body.passwd;
    let phone;
    let email;
    let query;
    let isPhone;
    authLogger.debug(`signup, 
    emailPhone: ${emailPhone}`);
    if (isNaN(emailPhone)) {
        query = {
            email: emailPhone
        };
        isPhone = false;
        email = emailPhone;
    }
    else {
        query = {
            phone: emailPhone
        };
        isPhone = true;
        phone = emailPhone;
    }
    foundUser = await user_model_1.user.findOne(query);
    /* if (userType === 'company') {
      foundUser = await companyMain.findOne(query);
    } else {
      foundUser = await user.findOne(query);
    }*/
    if (foundUser) {
        const phoneOrEmail = isPhone ? 'phone' : 'email';
        const response = {
            success: false,
            err: phoneOrEmail +
                ', already exists, try using another'
        };
        return res.status(200).send(response);
    }
    let permissions;
    const expireAt = Date.now();
    let company;
    let savedSub;
    if (userType === 'company') {
        const companyCount = await company_model_1.companyMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        const companyUrId = (0, stock_universal_server_1.makeUrId)(Number(companyCount[0]?.urId || '0'));
        const name = 'company ' + (0, stock_universal_1.makeRandomString)(11, 'letters');
        permissions = {
            companyAdminAccess: true
        };
        const newCompany = new company_model_1.companyMain({
            urId: companyUrId,
            name,
            displayName: name,
            expireAt,
            countryCode: '+256'
        });
        let savedErr;
        company = await newCompany.save().catch(err => {
            authLogger.error('save error', err);
            savedErr = err;
            return null;
        });
        if (savedErr) {
            return res.status(500).send({ success: false });
        }
        const freePkg = stock_universal_1.subscriptionPackages[3];
        const startDate = new Date();
        const now = new Date();
        const endDate = now.setDate(now.getDate() + (0, company_subscription_routes_1.getDays)(freePkg.duration));
        const newSub = new company_subscription_model_1.companySubscriptionMain({
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
    }
    else {
        permissions = {
            buyer: true,
            companyAdminAccess: false
        };
    }
    const count = await user_model_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const name = 'user ' + (0, stock_universal_1.makeRandomString)(11, 'letters');
    const newUser = new user_model_1.user({
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
    let response = {
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
            response.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            response.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        return response;
    });
    if (!response.success) {
        return res.status(response.status).send(response);
    }
    if (company) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        company.owner = saved._id;
        let savedErr;
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
        response = await (0, universial_controller_1.sendTokenPhone)(saved);
    }
    else {
        response = await (0, universial_controller_1.sendTokenEmail)(saved, type, stock_auth_local_1.stockAuthConfig.localSettings.appOfficialName);
    }
    if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        await user_model_1.user.deleteOne({ _id: saved._id });
        if (company) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            await company_model_1.companyMain.deleteOne({ _id: company._id });
        }
        if (savedSub) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            await company_subscription_model_1.companySubscriptionMain.deleteOne({ _id: savedSub._id });
        }
        return res.status(200).send(response);
    }
    if (Boolean(response.success)) {
        const toReturn = {
            success: true,
            msg: response.msg,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _id: saved._id
        };
        return res.status(200).send(toReturn);
    }
    const toSend = {
        success: false,
        err: 'we could not process your request, something went wrong, but we are working on it'
    };
    return res.status(500).send(toSend);
};
exports.signupFactorRelgator = signupFactorRelgator;
/**
 * Handles the user login request.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the user information and token.
 */
const userLoginRelegator = async (req, res, next) => {
    const { emailPhone } = req.body;
    const { query } = (0, auth_controller_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    const foundUser = await user_model_1.userLean
        .findOne({ ...query, ...{ userType: { $ne: 'customer' } } })
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
        .lean()
        // .select(userAuthSelect)
        .catch(err => {
        authLogger.error('Find user projection err', err);
        return null;
    });
    if (!foundUser) {
        return res.status(404).send({ msg: 'Account does not exist!' });
    }
    if (!foundUser.password || !foundUser.verified) {
        req.body.foundUser = foundUser;
        return next();
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const company = await company_model_1.companyLean.findById(foundUser?.companyId)
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
        .lean();
    let permissions;
    // TODO scan for all object id comparisons// ALSO does it affete find, I think not likely but test out
    if (company && company.owner === foundUser._id.toString()) {
        permissions = {
            companyAdminAccess: true
        };
    }
    else {
        permissions = foundUser.permissions || {};
    }
    // delete user.password; //we do not want to send back password
    const userInfo = (0, universial_controller_1.setUserInfo)(foundUser._id.toString(), permissions, foundUser.companyId, { active: !company.blocked });
    const token = (0, universial_controller_1.generateToken)(userInfo, '1d', stock_auth_local_1.stockAuthConfig.authSecrets.jwtSecret);
    let activeSubscription;
    const now = new Date();
    if (company) {
        const subsctn = await company_subscription_model_1.companySubscriptionLean.findOne({ companyId: company._id, status: 'paid' })
            .lean()
            .gte('endDate', now)
            .sort({ endDate: 1 });
        activeSubscription = subsctn;
    }
    foundUser.companyId = company;
    const nowResponse = {
        success: true,
        user: foundUser,
        token,
        activeSubscription
    };
    return res.status(200).send(nowResponse);
};
exports.userLoginRelegator = userLoginRelegator;
const addUser = async (req, res, next) => {
    const userData = req.body.user;
    const parsed = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    userData.companyId = queryId;
    if (parsed.profilePic) {
        userData.profilePic = parsed.profilePic || userData.profilePic;
    }
    if (parsed.coverPic) {
        userData.profileCoverPic = parsed.coverPic || userData.profileCoverPic;
    }
    if (parsed.newFiles) {
        userData.photos = parsed.newFiles;
        if (!parsed.profilePic) {
            userData.profilePic = parsed.newFiles[0];
        }
    }
    const count = await user_model_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    userData.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const newUser = new user_model_1.user(userData);
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
        req.body.savedUser = savedUser;
        return next();
    }
    return res.status(status).send(response);
};
exports.addUser = addUser;
const updateUserBulk = async (req, res, next) => {
    const updatedUser = req.body.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedUser;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const foundUser = await user_model_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!foundUser) {
        return res.status(404).send({ success: false });
    }
    if (!foundUser.urId) {
        const count = await user_model_1.user
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundUser.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    }
    const parsed = req.body;
    if (parsed) {
        if (parsed.profilePic) {
            foundUser.profilePic = parsed.profilePic || foundUser.profilePic;
        }
        if (parsed.coverPic) {
            foundUser.profileCoverPic = parsed.coverPic || foundUser.profileCoverPic;
        }
        if (parsed.newFiles) {
            const oldPhotos = foundUser.photos || [];
            foundUser.photos = [...oldPhotos, ...parsed.newFiles];
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
    if (response.success) {
        return next();
    }
    return res.status(status).send(response);
};
exports.updateUserBulk = updateUserBulk;
exports.userAuthRoutes.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
exports.userAuthRoutes.get('/authexpress/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user_model_1.userLean
        .findById(userId)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // .populate({ path: 'companyId', model: companyLean })
        .lean()
        .select(user_model_1.userAuthSelect)
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
    const company = await company_model_1.companyLean
        .findById(foundUser.companyId)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .lean().select({ blocked: 1, _id: 1 });
    let permissions;
    if (company && company.owner === foundUser._id.toString()) {
        permissions = {
            companyAdminAccess: true
        };
    }
    else {
        permissions = foundUser.permissions;
    }
    const userInfo = (0, universial_controller_1.setUserInfo)(foundUser._id.toString(), permissions, foundUser.companyId, { active: !company.blocked });
    foundUser.companyId = company;
    const token = (0, universial_controller_1.generateToken)(userInfo, '1d', stock_auth_local_1.stockAuthConfig.authSecrets.jwtSecret);
    const nowResponse = {
        success: true,
        user: foundUser,
        token
    };
    return res.status(200).send(nowResponse);
});
exports.userAuthRoutes.post('/login', async (req, res, next) => {
    req.body.from = 'user';
    const { emailPhone } = req.body;
    authLogger.debug(`login attempt,
    emailPhone: ${emailPhone}`);
    const { query, isPhone } = (0, auth_controller_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    const foundUser = await user_model_1.user.findOne({ ...query, ...{ verified: true, userType: { $ne: 'customer' } } });
    if (!foundUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    req.body.isPhone = isPhone;
    req.body.foundUser = foundUser;
    return next();
}, auth_controller_1.checkIpAndAttempt, exports.userLoginRelegator, auth_controller_1.recoverAccountFactory);
// okay
exports.userAuthRoutes.post('/signup', (req, res, next) => {
    const user = req.body;
    req.body = user;
    return next();
}, auth_controller_1.isTooCommonPhrase, auth_controller_1.isInAdictionaryOnline, exports.signupFactorRelgator, auth_controller_1.recoverAccountFactory, (req, res) => {
    return res.status(401).send({ success: false, msg: 'unauthourised' });
});
exports.userAuthRoutes.post('recover', async (req, res, next) => {
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
    const foundUser = await user_model_1.user.findOne({ ...query, ...{ userType: { $ne: 'customer' } } });
    req.body.foundUser = foundUser;
    return next();
}, auth_controller_1.recoverAccountFactory);
exports.userAuthRoutes.post('/confirm', async (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, verifycode, nowHow } = req.body;
    authLogger.debug(`verify, verifycode: ${verifycode}, how: ${nowHow}`);
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
    const foundUser = await user_model_1.user.findById(_id);
    req.body.foundUser = foundUser;
    return next();
}, auth_controller_1.confirmAccountFactory);
exports.userAuthRoutes.put('/resetpaswd', async (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, verifycode } = req.body;
    authLogger.debug(`resetpassword, 
    verifycode: ${verifycode}`);
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
    const foundUser = await user_model_1.user.findById(_id);
    req.body.foundUser = foundUser;
    return next();
}, auth_controller_1.resetAccountFactory);
exports.userAuthRoutes.post('/manuallyverify/:userId/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), async (req, res) => {
    const { userId, companyIdParam } = req.params;
    const { companyId } = req.user;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!stock_auth_local_1.stockAuthConfig || !stock_auth_local_1.stockAuthConfig.localSettings || stock_auth_local_1.stockAuthConfig.localSettings.production) {
        return res.status(401).send({ success: false, er: 'unauthourized' });
    }
    const foundUser = await user_model_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
exports.userAuthRoutes.post('/sociallogin', async (req, res) => {
    const credentials = req.body;
    authLogger.debug(`sociallogin, 
    socialId: ${credentials.socialId}`);
    const foundUser = await user_model_1.user.findOne({
        fromsocial: true,
        socialframework: credentials.type,
        socialId: credentials.socialId
    });
    if (!foundUser) {
        const count = await user_model_1.user
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        const urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
        const newUser = new user_model_1.user({
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
            return err;
        });
        if (status === 200) {
            response = {
                success: true,
                user: foundUser.toAuthJSON()
            };
            return res.status(200).send(response);
        }
        else {
            return res.status(403).send(response);
        }
    }
});
exports.userAuthRoutes.put('/updateprofile/:formtype/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
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
    const foundUser = await user_model_1.user
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
            users = await user_model_1.user
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
            users = await user_model_1.user
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
exports.userAuthRoutes.post('/updateprofileimg/:companyIdParam', stock_universal_server_1.requireAuth, stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, async (req, res) => {
    let userId = req.body.user?._id;
    if (!userId) {
        userId = req.user.userId;
    }
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    authLogger.debug('updateprofileimg');
    const foundUser = await user_model_1.user
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
            const oldPhotos = foundUser.photos || [];
            foundUser.photos = [...oldPhotos, ...parsed.newFiles];
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
exports.userAuthRoutes.put('/updatepermissions/:userId/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), async (req, res) => {
    const { userId } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    authLogger.debug('updatepermissions');
    const foundUser = await user_model_1.user
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
exports.userAuthRoutes.put('/blockunblock/:userId', stock_universal_server_1.requireAuth, superadmin_routes_1.requireSuperAdmin, async (req, res) => {
    const { userId } = req.paras;
    authLogger.debug('blockunblock');
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user_model_1.user
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
exports.userAuthRoutes.put('/addupdateaddr/:userId/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    authLogger.debug('updatepermissions');
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user_model_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
exports.userAuthRoutes.get('/getoneuser/:urId/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const oneUser = await user_model_1.userLean
        .findOne({ urId, queryId })
        .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
        .populate({ path: 'companyId', model: company_model_1.companyLean, transform: (doc) => (doc.blocked ? null : doc) })
        .lean();
    if (!oneUser || !oneUser.companyId) {
        return res.status(200).send({});
    }
    return res.status(200).send(oneUser);
});
exports.userAuthRoutes.get('/getusers/:where/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { where } = req.params;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;
    let filter;
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
          break;*/
        case 'customer':
            filter = {
                userType: 'customer',
                companyId: queryId
            };
            break;
        case 'staff':
            filter = {
                userType: 'staff',
                companyId: queryId
            };
            break;
        default:
            filter = { companyId: queryId, userType: { $ne: 'company' } };
            break;
    }
    authLogger.info('filter is ', filter);
    const all = await Promise.all([
        user_model_1.userLean
            .find({ ...filter })
            .sort({ fname: 1 })
            .limit(Number(currLimit))
            .skip(Number(currOffset))
            .populate({ path: 'profilePic', model: stock_universal_server_1.fileMetaLean })
            .populate({ path: 'profileCoverPic', model: stock_universal_server_1.fileMetaLean })
            .populate({ path: 'photos', model: stock_universal_server_1.fileMetaLean })
            .populate({ path: 'companyId', model: company_model_1.companyLean, select: { name: 1, blocked: 1 } })
            .lean(),
        user_model_1.userLean.countDocuments(filter)
    ]);
    authLogger.debug('aall[0] ', all[0]);
    const filteredFaqs = all[0].filter(data => !data.companyId.blocked);
    const response = {
        count: all[1],
        data: filteredFaqs
    };
    authLogger.debug('response is   ', response);
    return res.status(200).send(response);
});
exports.userAuthRoutes.post('/adduser/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), exports.addUser, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.post('/adduserimg/:companyIdParam', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, exports.addUser, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.put('/updateuserbulk/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), exports.updateUserBulk, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.post('/updateuserbulkimg/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, exports.updateUserBulk, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await user_model_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .deleteMany({ _id: { $in: ids }, companyId: queryId }).catch(err => {
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
exports.userAuthRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await user_model_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndDelete({ _id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.userAuthRoutes.put('/deleteimages/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), stock_universal_server_1.deleteFiles, async (req, res) => {
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
    const foundUser = await user_model_1.user
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