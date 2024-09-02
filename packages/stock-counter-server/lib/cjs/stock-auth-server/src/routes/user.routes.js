"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserBulk = exports.addUser = exports.userLoginRelegator = exports.signupFactorRelgator = exports.userAuthRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const company_model_1 = require("../models/company.model");
const company_subscription_model_1 = require("../models/subscriptions/company-subscription.model");
const user_model_1 = require("../models/user.model");
const stock_auth_local_1 = require("../stock-auth-local");
const auth_1 = require("../utils/auth");
const query_1 = require("../utils/query");
const universial_1 = require("../utils/universial");
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
 * Handles the login and registration process for superadmin users.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A Promise that resolves to void.
 */
// eslint-disable-next-line max-statements
const signupFactorRelgator = async (req, res, next) => {
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
    const foundUser = await user_model_1.user.findOne(query);
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
            return err;
        });
        if (company && company._id) {
            (0, stock_universal_server_1.addParentToLocals)(res, company._id, user_model_1.user.collection.collectionName, 'makeTrackEdit');
        }
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
        return err;
    });
    if (!response.success) {
        return res.status(response.status).send(response);
    }
    if (savedSub && savedSub._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, savedSub._id, user_model_1.user.collection.collectionName, 'makeTrackEdit');
    }
    if (company) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        company.owner = (saved)._id;
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
        response = await (0, universial_1.sendTokenPhone)(saved);
    }
    else {
        response = await (0, universial_1.sendTokenEmail)(saved, type, stock_auth_local_1.stockAuthConfig.localSettings.appOfficialName);
    }
    if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
        await user_model_1.user.deleteOne({ _id: (saved)._id });
        if (company) {
            await company_model_1.companyMain.deleteOne({ _id: company._id });
        }
        if (savedSub) {
            await company_subscription_model_1.companySubscriptionMain.deleteOne({ _id: savedSub._id });
        }
        return res.status(200).send(response);
    }
    if (Boolean(response.success)) {
        const toReturn = {
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
exports.signupFactorRelgator = signupFactorRelgator;
/**
 * Handles the user login request.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the user information and token.
 */
const userLoginRelegator = async (req, res, next) => {
    const { emailPhone } = req.body;
    const { query } = (0, auth_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    let { foundUser } = req.body;
    if (!foundUser) {
        foundUser = await user_model_1.userLean
            .findOne({ ...query, ...{ userType: { $ne: 'customer' } } })
            .populate([(0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()])
            .lean()
            // .select(userAuthSelect)
            .catch(err => {
            authLogger.error('Find user projection err', err);
            return null;
        });
    }
    if (!foundUser) {
        return res.status(404).send({ msg: 'Account does not exist!' });
    }
    if (!foundUser?.password || !foundUser?.verified) {
        return next();
    }
    const responseObj = await (0, universial_1.makeUserReturnObject)(foundUser);
    const nowResponse = {
        success: true,
        ...responseObj
    };
    return res.status(200).send(nowResponse);
};
exports.userLoginRelegator = userLoginRelegator;
/**
   * Remove all the uploaded files from the parsed object.
   * @param {object} parsed - Object that contains the fields to remove.
   * @param {boolean} directlyRemove - If true, remove the files directly.
   * @returns {Promise<boolean>} - True if all the files were removed.
   */
const reoveUploadedFiles = async (parsed, directlyRemove) => {
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
    const filesWithDir = await stock_universal_server_1.fileMetaLean.find({ _id: { $in: ids } }).lean().select({ _id: 1, url: 1 });
    if (filesWithDir && filesWithDir.length > 0) {
        await (0, stock_universal_server_1.deleteAllFiles)(filesWithDir, directlyRemove);
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
    const foundEmail = await user_model_1.userLean.findOne({ email: userData.email }).select({ email: 1 }).lean();
    if (foundEmail) {
        await reoveUploadedFiles(parsed, true);
        return res.status(401).send({ success: false, err: 'Email already exist found' });
    }
    const foundPhone = await user_model_1.userLean.findOne({ phone: userData.phone }).select({ phone: 1 }).lean();
    if (foundPhone) {
        await reoveUploadedFiles(parsed, true);
        return res.status(401).send({ success: false, err: 'Phone Number already exist found' });
    }
    userData.companyId = queryId;
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
    const count = await user_model_1.user
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
    if (savedUser && savedUser._id) {
        (0, stock_universal_server_1.addParentToLocals)(res, savedUser._id, user_model_1.user.collection.collectionName, 'makeTrackEdit');
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
exports.addUser = addUser;
/**
   * Updates the user's profile with the provided values and optional files.
   * @param companyId - The ID of the company
   * @param vals The values to update the user's profile with.
   * @param files Optional files to upload with the user.
   * @returns A success object indicating whether the user was updated successfully.
   */
const updateUserBulk = async (req, res, next) => {
    const updatedUser = req.body.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedUser;
    if (!_id) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    if (!queryId) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let filter = { _id, companyId: queryId };
    if (req.body.profileOnly === 'true') {
        const { userId } = req.user;
        filter = { user: userId };
    }
    const parsed = req.body;
    const foundUser = await user_model_1.user
        .findOne(filter);
    if (!foundUser) {
        if (parsed.newPhotos) {
            await (0, stock_universal_server_1.deleteAllFiles)(parsed.newPhotos, true);
        }
        return res.status(404).send({ success: false });
    }
    if (!foundUser.urId) {
        const count = await user_model_1.user
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundUser.urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
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
            foundUser.photos = [...oldPhotos, ...parsed.newPhotos];
        }
    }
    delete updatedUser._id;
    const keys = Object.keys(updatedUser);
    keys.forEach(key => {
        if (companyId === 'superAdmin' && key !== 'companyId' && key !== 'userType') {
            foundUser[key] = updatedUser[key] || foundUser[key];
        }
        else if (foundUser[key] && key !== 'password' && key !== 'email' && key !== 'phone' && key !== 'companyId' && key !== 'userType') {
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
exports.userAuthRoutes.get('/authexpress2', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user_model_1.userLean
        .findById(userId)
        .populate([(0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()])
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
    const responseObj = await (0, universial_1.makeUserReturnObject)(foundUser);
    const nowResponse = {
        success: true,
        ...responseObj
    };
    return res.status(200).send(nowResponse);
});
exports.userAuthRoutes.post('/login', async (req, res, next) => {
    req.body.from = 'user';
    const { emailPhone, userType } = req.body;
    let filter2 = {};
    if (userType) {
        filter2 = { userType };
    }
    else {
        filter2 = { userType: { $ne: 'customer' } };
    }
    authLogger.debug(`login attempt,
    emailPhone: ${emailPhone}`);
    const { query, isPhone } = (0, auth_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    const foundUser = await user_model_1.user.findOne({ ...query, ...filter2 })
        .populate([(0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()]);
    if (!foundUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    req.body.isPhone = isPhone;
    req.body.foundUser = foundUser;
    return next();
}, auth_1.checkIpAndAttempt, exports.userLoginRelegator, auth_1.recoverAccountFactory);
exports.userAuthRoutes.get('/authexpress', stock_universal_server_1.requireAuth, async (req, res, next) => {
    req.body.from = 'user';
    authLogger.debug('authexpress');
    const { userId } = req.user;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const foundUser = await user_model_1.user.findOne({ _id: userId, ...{ userType: { $ne: 'customer' }, verified: true } })
        .populate([(0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()]);
    if (!foundUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    return next();
}, auth_1.checkIpAndAttempt, exports.userLoginRelegator, auth_1.recoverAccountFactory);
// okay
exports.userAuthRoutes.post('/signup', (req, res, next) => {
    return next();
}, auth_1.isTooCommonPhrase, auth_1.isInAdictionaryOnline, exports.signupFactorRelgator, auth_1.recoverAccountFactory, (req, res) => {
    return res.status(401).send({ success: false, msg: 'unauthourised' });
});
exports.userAuthRoutes.post('/recover', async (req, res, next) => {
    const emailPhone = req.body.emailPhone;
    authLogger.debug(`recover, 
    emailphone: ${emailPhone}`);
    const { query } = (0, auth_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    const foundUser = await user_model_1.user.findOne({ ...query, ...{ userType: { $ne: 'customer' } } })
        .populate([(0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()]);
    req.body.foundUser = foundUser;
    return next();
}, auth_1.recoverAccountFactory);
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
    const foundUser = await user_model_1.user.findById(_id)
        .populate([(0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()]);
    req.body.foundUser = foundUser;
    return next();
}, auth_1.confirmAccountFactory);
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
    const foundUser = await user_model_1.user.findById(_id)
        .populate([(0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()]);
    req.body.foundUser = foundUser;
    return next();
}, auth_1.resetAccountFactory);
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
        if (nUser && nUser._id) {
            (0, stock_universal_server_1.addParentToLocals)(res, nUser._id, user_model_1.user.collection.collectionName, 'makeTrackEdit');
        }
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
            } */
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
            } */
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
            } */
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
        if (parsed.newPhotos) {
            const oldPhotos = foundUser.photos || [];
            foundUser.photos = [...oldPhotos, ...parsed.newPhotos];
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
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
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
    const oneUser = await user_model_1.userLean
        .findOne({ urId, ...filter })
        .populate([(0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()])
        .populate({ path: 'companyId', model: company_model_1.companyLean, transform: (doc) => (doc.blocked ? null : doc) })
        .lean();
    if (!oneUser || !oneUser.companyId) {
        return res.status(200).send({});
    }
    (0, stock_universal_server_1.addParentToLocals)(res, oneUser._id, user_model_1.user.collection.collectionName, 'trackDataView');
    return res.status(200).send(oneUser);
});
exports.userAuthRoutes.get('/getusers/:where/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
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
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
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
        user_model_1.userLean
            .find({ ...filter2, ...filter })
            .sort({ fname: 1 })
            .limit(Number(currLimit))
            .skip(Number(currOffset))
            .populate([(0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()])
            .populate({ path: 'companyId', model: company_model_1.companyLean, select: { name: 1, blocked: 1 } })
            .lean(),
        user_model_1.userLean.countDocuments({ ...filter2, ...filter })
    ]);
    const filteredFaqs = all[0].filter(data => !data.companyId.blocked);
    const response = {
        count: all[1],
        data: filteredFaqs
    };
    for (const val of all[0]) {
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, user_model_1.user.collection.collectionName, 'trackDataView');
    }
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
exports.userAuthRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    let filesWithDir;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const alltoDelete = await user_model_1.user.find({ _id: { $in: ids }, companyId: queryId })
        .populate([(0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)()])
        .lean();
    let toDelIds = [];
    for (const user of alltoDelete) {
        if (user.userType === 'eUser') {
            toDelIds = [...toDelIds, user._id];
            if (user.photos?.length > 0) {
                filesWithDir = [...filesWithDir, ...user.photos];
            }
        }
    }
    await (0, stock_universal_server_1.deleteAllFiles)(filesWithDir);
    /* const deleted = await user
      .deleteMany({ _id: { $in: toDelIds }, companyId: queryId }).catch(err => {
        authLogger.error('deletemany users failed with error: ' + err.message);
  
        return null;
      }); */
    const deleted = await user_model_1.user
        .updateMany({ _id: { $in: toDelIds }, companyId: queryId }, {
        $set: { isDeleted: true }
    }).catch(err => {
        authLogger.error('deletemany users failed with error: ' + err.message);
        return null;
    });
    if (Boolean(deleted)) {
        for (const val of toDelIds) {
            (0, stock_universal_server_1.addParentToLocals)(res, val, user_model_1.user.collection.collectionName, 'trackDataDelete');
        }
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
exports.userAuthRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const found = await user_model_1.user.findOne({ _id, companyId: queryId })
        .populate([(0, query_1.populatePhotos)()])
        .lean();
    if (found) {
        if (found.userType === 'eUser') {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const filesWithDir = found.photos.map(photo => ({
            _id: photo._id,
            url: photo.url
        }));
        await (0, stock_universal_server_1.deleteAllFiles)(filesWithDir);
    }
    /* const deleted = await user
      .findOneAndDelete({ _id, companyId: queryId }); */
    const deleted = await user_model_1.user
        .updateOne({ _id, companyId: queryId }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, user_model_1.user.collection.collectionName, 'makeTrackEdit');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.userAuthRoutes.put('/deleteimages/:companyIdParam', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), (0, stock_universal_server_1.deleteFiles)(true), async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedUser = req.body.user;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedUser;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user_model_1.user
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
exports.userAuthRoutes.get('/existsemailphone/:emailPhone', async (req, res) => {
    const { emailPhone } = req.params;
    const { query } = (0, auth_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    const foundUser = await user_model_1.user.findOne({ ...query }).lean().select({ _id: 1 });
    return res.status(401).send({ success: true, exists: Boolean(foundUser) });
});
//# sourceMappingURL=user.routes.js.map