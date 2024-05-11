import { makeRandomString, subscriptionPackages } from '@open-stock/stock-universal';
import { appendBody, deleteAllFiles, deleteFiles, fileMetaLean, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, stringifyMongooseErr, uploadFiles, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { checkIpAndAttempt, confirmAccountFactory, determineIfIsPhoneAndMakeFilterObj, isInAdictionaryOnline, isTooCommonPhrase, recoverAccountFactory, resetAccountFactory } from '../controllers/auth.controller';
import { generateToken, sendTokenEmail, sendTokenPhone, setUserInfo } from '../controllers/universial.controller';
import { companyLean, companyMain } from '../models/company.model';
import { companySubscriptionLean, companySubscriptionMain } from '../models/subscriptions/company-subscription.model';
import { user, userAuthSelect, userLean } from '../models/user.model';
import { stockAuthConfig } from '../stock-auth-local';
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
export const signupFactorRelgator = async (req, res, next) => {
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
    const foundUser = await user.findOne(query);
    /* if (userType === 'company') {
      foundUser = await companyMain.findOne(query);
    } else {
      foundUser = await user.findOne(query);
    }*/
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
        const companyCount = await companyMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
        let savedErr;
        company = await newCompany.save().catch(err => {
            authLogger.error('save error', err);
            savedErr = err;
            return null;
        });
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
    }
    else {
        permissions = {
            buyer: true,
            companyAdminAccess: false
        };
    }
    const count = await user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
            response.err = stringifyMongooseErr(err.errors);
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
        response = await sendTokenPhone(saved);
    }
    else {
        response = await sendTokenEmail(saved, type, stockAuthConfig.localSettings.appOfficialName);
    }
    if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        await user.deleteOne({ _id: saved._id });
        if (company) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            await companyMain.deleteOne({ _id: company._id });
        }
        if (savedSub) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            await companySubscriptionMain.deleteOne({ _id: savedSub._id });
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
/**
 * Handles the user login request.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response with the user information and token.
 */
export const userLoginRelegator = async (req, res, next) => {
    const { emailPhone } = req.body;
    const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
    let { foundUser } = req.body;
    if (!foundUser) {
        foundUser = await userLean
            .findOne({ ...query, ...{ userType: { $ne: 'customer' } } })
            .populate({ path: 'profilePic', model: fileMetaLean })
            .populate({ path: 'profileCoverPic', model: fileMetaLean })
            .populate({ path: 'photos', model: fileMetaLean })
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const company = await companyLean.findById(foundUser?.companyId)
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
    const userInfo = setUserInfo(foundUser._id.toString(), permissions, foundUser.companyId, { active: !company.blocked });
    const token = generateToken(userInfo, '1d', stockAuthConfig.authSecrets.jwtSecret);
    let activeSubscription;
    const now = new Date();
    if (company) {
        const subsctn = await companySubscriptionLean.findOne({ companyId: company._id, status: 'paid' })
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
const reoveUploadedFiles = async (parsed) => {
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
        await deleteAllFiles(filesWithDir);
    }
    return true;
};
export const addUser = async (req, res, next) => {
    const userData = req.body.user;
    const parsed = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundEmail = await userLean.findOne({ email: userData.email }).select({ email: 1 }).lean();
    if (foundEmail) {
        await reoveUploadedFiles(parsed);
        return res.status(401).send({ success: false, err: 'Email already exist found' });
    }
    const foundPhone = await userLean.findOne({ phone: userData.phone }).select({ phone: 1 }).lean();
    if (foundPhone) {
        await reoveUploadedFiles(parsed);
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
    const count = await user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    userData.urId = makeUrId(Number(count[0]?.urId || '0'));
    const newUser = new user(userData);
    let status = 200;
    let response = { success: true };
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
export const updateUserBulk = async (req, res, next) => {
    const updatedUser = req.body.user;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = updatedUser;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const foundUser = await user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndUpdate({ _id, companyId: queryId });
    if (!foundUser) {
        return res.status(404).send({ success: false });
    }
    if (!foundUser.urId) {
        const count = await user
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({ companyId: queryId }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundUser.urId = makeUrId(Number(count[0]?.urId || '0'));
    }
    const parsed = req.body;
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
            errResponse.err = stringifyMongooseErr(err.errors);
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
userAuthRoutes.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
userAuthRoutes.get('/authexpress2', requireAuth, async (req, res) => {
    const { userId } = req.user;
    const isValid = verifyObjectId(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await userLean
        .findById(userId)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'profilePic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'profileCoverPic', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .populate({ path: 'photos', model: fileMetaLean, transform: (doc) => ({ _id: doc._id, url: doc.url }) })
        // .populate({ path: 'companyId', model: companyLean })
        .lean()
        .select(userAuthSelect)
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
    const company = await companyLean
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
    const userInfo = setUserInfo(foundUser._id.toString(), permissions, foundUser.companyId, { active: !company.blocked });
    foundUser.companyId = company;
    const token = generateToken(userInfo, '1d', stockAuthConfig.authSecrets.jwtSecret);
    const nowResponse = {
        success: true,
        user: foundUser,
        token
    };
    return res.status(200).send(nowResponse);
});
userAuthRoutes.post('/login', async (req, res, next) => {
    req.body.from = 'user';
    const { emailPhone } = req.body;
    authLogger.debug(`login attempt,
    emailPhone: ${emailPhone}`);
    const { query, isPhone } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
    const foundUser = await user.findOne({ ...query, ...{ userType: { $ne: 'customer' } } });
    if (!foundUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    req.body.isPhone = isPhone;
    req.body.foundUser = foundUser;
    return next();
}, checkIpAndAttempt, userLoginRelegator, recoverAccountFactory);
userAuthRoutes.get('/authexpress', requireAuth, async (req, res, next) => {
    req.body.from = 'user';
    authLogger.debug('authexpress');
    const { userId } = req.user;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const foundUser = await user.findOne({ _id: userId, ...{ userType: { $ne: 'customer' }, verified: true } });
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
userAuthRoutes.post('/recover', async (req, res, next) => {
    const emailPhone = req.body.emailPhone;
    authLogger.debug(`recover, 
    emailphone: ${emailPhone}`);
    const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
    const foundUser = await user.findOne({ ...query, ...{ userType: { $ne: 'customer' } } });
    req.body.foundUser = foundUser;
    return next();
}, recoverAccountFactory);
userAuthRoutes.post('/confirm', async (req, res, next) => {
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
    const foundUser = await user.findById(_id);
    req.body.foundUser = foundUser;
    return next();
}, confirmAccountFactory);
userAuthRoutes.put('/resetpaswd', async (req, res, next) => {
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
    const foundUser = await user.findById(_id);
    req.body.foundUser = foundUser;
    return next();
}, resetAccountFactory);
userAuthRoutes.post('/manuallyverify/:userId/:companyIdParam', requireAuth, roleAuthorisation('users', 'update'), async (req, res) => {
    const { userId, companyIdParam } = req.params;
    const { companyId } = req.user;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([userId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!stockAuthConfig || !stockAuthConfig.localSettings || stockAuthConfig.localSettings.production) {
        return res.status(401).send({ success: false, er: 'unauthourized' });
    }
    const foundUser = await user
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
userAuthRoutes.post('/sociallogin', async (req, res) => {
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
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
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
        let errResponse;
        const nUser = await newUser.save().catch(err => {
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
                errResponse.err = stringifyMongooseErr(err.errors);
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
userAuthRoutes.put('/updateprofile/:formtype/:companyIdParam', requireAuth, async (req, res) => {
    const { userId } = req.user;
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
            users = await user
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
            users = await user
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
                errResponse.err = stringifyMongooseErr(err.errors);
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
userAuthRoutes.post('/updateprofileimg/:companyIdParam', requireAuth, uploadFiles, appendBody, saveMetaToDb, async (req, res) => {
    let userId = req.body.user?._id;
    if (!userId) {
        userId = req.user.userId;
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
userAuthRoutes.put('/updatepermissions/:userId/:companyIdParam', requireAuth, roleAuthorisation('users', 'update'), async (req, res) => {
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
    let response = { success: true };
    await foundUser.save().catch(err => {
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
userAuthRoutes.put('/blockunblock/:userId', requireAuth, requireSuperAdmin, async (req, res) => {
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
    let response = { success: true };
    await foundUser.save().catch(err => {
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
userAuthRoutes.put('/addupdateaddr/:userId/:companyIdParam', requireAuth, async (req, res) => {
    const { userId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    authLogger.debug('updatepermissions');
    const isValid = verifyObjectIds([userId, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user
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
userAuthRoutes.get('/getoneuser/:urId/:companyIdParam', requireAuth, roleAuthorisation('users', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const oneUser = await userLean
        .findOne({ urId, queryId })
        .populate({ path: 'profilePic', model: fileMetaLean })
        .populate({ path: 'profileCoverPic', model: fileMetaLean })
        .populate({ path: 'photos', model: fileMetaLean })
        .populate({ path: 'companyId', model: companyLean, transform: (doc) => (doc.blocked ? null : doc) })
        .lean();
    if (!oneUser || !oneUser.companyId) {
        return res.status(200).send({});
    }
    return res.status(200).send(oneUser);
});
userAuthRoutes.get('/getusers/:where/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'read'), async (req, res) => {
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { where } = req.params;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
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
        case 'registered':
            filter = { companyId: queryId, userType: { $ne: 'company' }, verified: true };
            break;
        default:
            filter = { companyId: queryId, userType: { $ne: 'company' } };
            break;
    }
    authLogger.info('filter is ', filter);
    const all = await Promise.all([
        userLean
            .find({ ...filter })
            .sort({ fname: 1 })
            .limit(Number(currLimit))
            .skip(Number(currOffset))
            .populate({ path: 'profilePic', model: fileMetaLean })
            .populate({ path: 'profileCoverPic', model: fileMetaLean })
            .populate({ path: 'photos', model: fileMetaLean })
            .populate({ path: 'companyId', model: companyLean, select: { name: 1, blocked: 1 } })
            .lean(),
        userLean.countDocuments(filter)
    ]);
    const filteredFaqs = all[0].filter(data => !data.companyId.blocked);
    const response = {
        count: all[1],
        data: filteredFaqs
    };
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
userAuthRoutes.put('/deletemany/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([...ids, ...[queryId]]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await user
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
userAuthRoutes.put('/deleteone/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), deleteFiles, async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findOneAndDelete({ _id, companyId: queryId });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
userAuthRoutes.put('/deleteimages/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), deleteFiles, async (req, res) => {
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
    const isValid = verifyObjectIds([_id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user
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
//# sourceMappingURL=user.routes.js.map