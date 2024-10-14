import { makeRandomString, subscriptionPackages } from '@open-stock/stock-universal';
import { addParentToLocals, appendBody, constructFiltersFromBody, deleteAllFiles, deleteFiles, fileMetaLean, generateUrId, handleMongooseErr, lookupFacet, lookupPhotos, lookupTrackEdit, lookupTrackView, mainLogger, makeCompanyBasedQuery, offsetLimitRelegator, requireAuth, roleAuthorisation, saveMetaToDb, uploadFiles, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import { Error } from 'mongoose';
import { companyLean, companyMain } from '../models/company.model';
import { companySubscriptionMain } from '../models/subscriptions/company-subscription.model';
import { user, userAuthSelect, userLean } from '../models/user.model';
import { stockAuthConfig } from '../stock-auth-local';
import { checkIpAndAttempt, confirmAccountFactory, determineIfIsPhoneAndMakeFilterObj, isInAdictionaryOnline, isTooCommonPhrase, recoverAccountFactory, resetAccountFactory } from '../utils/auth';
import { populatePhotos, populateProfileCoverPic, populateProfilePic, populateTrackEdit, populateTrackView } from '../utils/query';
import { makeUserReturnObject, sendTokenEmail, sendTokenPhone } from '../utils/universial';
import { requireActiveCompany } from './company-auth';
import { getDays } from './subscriptions/company-subscription.routes';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
const passport = require('passport');
/**
 * Router for authentication routes.
 */
export const userAuthRoutes = express.Router();
export const determineUserToRemove = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
model, linkedModels) => {
    return async (req, res, next) => {
        const { _id } = req.body;
        const isValid = verifyObjectId(_id);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const found = await model.findOne({ _id });
        if (!found || !found.user) {
            return res.status(404).send({ msg: 'User not found', status: 404 });
        }
        const canRemove = await canRemoveOneUser(found.user, linkedModels);
        if (!canRemove.success) {
            return res.status(401).send({ ...canRemove, status: 401 });
        }
        req.body.userId = found.user;
        next();
    };
};
export const determineUsersToRemove = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
model, linkedModels) => {
    return async (req, res, next) => {
        const { _ids } = req.body;
        const isValid = verifyObjectIds(_ids);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const manay = await model.find({ _id: { $in: _ids } });
        const promises = manay.map(async (val) => {
            const canRemove = await canRemoveOneUser(val.user, linkedModels);
            return new Promise(resolve => {
                resolve({ ...canRemove, ...val });
            });
        });
        const all = await Promise.all(promises);
        const newIds = all.filter(val => val.success && val.user).map(val => val._id.toString());
        const newUserIds = all.filter(val => val.success).map(val => val.user);
        if (newIds.length <= 0) {
            return res.status(401).send({ success: false, status: 401, err: 'sorry all users selected are linked' });
        }
        req.body._ids = newIds;
        req.body.userIds = newUserIds;
        next();
    };
};
export const canRemoveOneUser = async (id, modelsCred) => {
    const promises = modelsCred.map(async (val) => {
        const found = await val.model.findOne({ [val.field]: id });
        let toReturnMsg;
        if (found) {
            toReturnMsg = val.errMsg;
        }
        else {
            toReturnMsg = '';
        }
        return new Promise(resolve => resolve(toReturnMsg));
    });
    const all = await Promise.all(promises);
    for (const val of all) {
        if (val) {
            return {
                success: false,
                msg: val
            };
        }
    }
    return {
        success: true,
        msg: 'user is not linked to anything'
    };
};
// eslint-disable-next-line max-statements
export const signupFactorRelgator = async (req, res, next) => {
    mainLogger.info('signupFactorRelgator');
    const { emailPhone } = req.body;
    const userType = req.body.userType || 'eUser';
    const passwd = req.body.passwd;
    let phone;
    let email;
    let query;
    let isPhone;
    mainLogger.debug(`signup, 
    emailPhone: ${emailPhone}`);
    if (isNaN(Number(emailPhone))) {
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
    let companyId = '';
    let companySubcripnId = '';
    if (userType === 'company') {
        const companyUrId = await generateUrId(companyMain);
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
        company = await newCompany.save().catch((err) => err);
        if (company instanceof Error) {
            const errResponse = handleMongooseErr(company);
            return res.status(errResponse.status).send(errResponse);
        }
        if (company && company._id) {
            companyId = company._id.toString();
            addParentToLocals(res, company._id, user.collection.collectionName, 'makeTrackEdit');
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
        savedSub = await newSub.save().catch((err) => err);
        if (savedSub instanceof Error) {
            const errResponse = handleMongooseErr(savedSub);
            return res.status(errResponse.status).send(errResponse);
        }
        if (savedSub && savedSub._id) {
            companySubcripnId = savedSub._id.toString();
            addParentToLocals(res, savedSub._id, user.collection.collectionName, 'makeTrackEdit');
        }
    }
    else {
        permissions = {
            buyer: true,
            companyAdminAccess: false
        };
    }
    const urId = await generateUrId(user);
    const name = 'user ' + makeRandomString(11, 'letters');
    const newUser = new user({
        companyId,
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
    const savedRes = await newUser.save().catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    if (companyId) {
        const companyUpdateRes = await companyMain.updateOne({
            _id: companyId
        }, {
            $set: {
                owner: savedRes._id
            }
        }).catch((err) => err);
        if (companyUpdateRes instanceof Error) {
            const errResponse = handleMongooseErr(companyUpdateRes);
            return res.status(errResponse.status).send(errResponse);
        }
    }
    // note now is only token but build a counter later to make sure that the token and link methods are shared
    const type = 'token';
    let response = {
        success: false
    };
    if (isPhone) {
        response = await sendTokenPhone(savedRes);
    }
    else {
        response = await sendTokenEmail(savedRes, type, stockAuthConfig.localSettings.appOfficialName);
    }
    if (!response.success) {
        await user.deleteOne({ _id: savedRes._id });
        if (companyId) {
            await companyMain.deleteOne({ _id: companyId });
        }
        if (companySubcripnId) {
            await companySubscriptionMain.deleteOne({ _id: companySubcripnId });
        }
        return res.status(200).send(response);
    }
    if (Boolean(response.success)) {
        const toReturn = {
            success: true,
            msg: response.msg,
            _id: savedRes._id
        };
        return res.status(200).send(toReturn);
    }
    const toSend = {
        success: false,
        err: 'we could not process your request, something went wrong, but we are working on it'
    };
    return res.status(500).send(toSend);
};
export const userLoginRelegator = async (req, res, next) => {
    mainLogger.info('userLoginRelegator');
    const { emailPhone, userType } = req.body;
    const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
    let { foundUser } = req.body;
    let filter2 = {};
    if (userType) {
        filter2 = { userType };
    }
    else {
        filter2 = { userType: { $ne: 'customer' } };
    }
    if (!foundUser) {
        foundUser = await userLean
            .findOne({ ...query, ...filter2 })
            .populate([
            populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
        ])
            .lean()
            // .select(userAuthSelect)
            .catch(err => {
            mainLogger.error('Find user projection err', err);
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
    responseObj.success = true;
    const nowResponse = {
        ...responseObj
    };
    return res.status(200).send(nowResponse);
};
const reoveUploadedFiles = async (parsed, directlyRemove) => {
    mainLogger.info('reoveUploadedFiles');
    let _ids = [];
    if (parsed.profilePic) {
        _ids.push(parsed.profilePic);
    }
    if (parsed.coverPic) {
        _ids.push(parsed.coverPic);
    }
    if (parsed.newPhotos) {
        const newPhotos = parsed.newPhotos.map(val => {
            if (typeof val === 'string') {
                return val;
            }
            else {
                return val._id;
            }
        });
        _ids = [..._ids, ...newPhotos];
    }
    if (_ids.length === 0) {
        return true;
    }
    const filesWithDir = await fileMetaLean.find({ _id: { $in: _ids } }).lean().select({ _id: 1, url: 1 });
    if (filesWithDir && filesWithDir.length > 0) {
        await deleteAllFiles(filesWithDir, directlyRemove);
    }
    return true;
};
export const addUser = async (req, res, next) => {
    if (!req.body.user) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    mainLogger.info('adding user');
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
    userData.companyId = userData.companyId || filter.companyId;
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
    userData.urId = await generateUrId(user);
    const newUser = new user(userData);
    const savedUserRes = await newUser.save().catch((err) => err);
    if (savedUserRes instanceof Error) {
        const errResponse = handleMongooseErr(savedUserRes);
        return res.status(errResponse.status).send(errResponse);
    }
    if (savedUserRes && savedUserRes._id) {
        addParentToLocals(res, savedUserRes._id, user.collection.collectionName, 'makeTrackEdit');
    }
    req.body.user = savedUserRes;
    return next();
};
export const updateUserBulk = async (req, res, next) => {
    if (!req.body.user || !req.user) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const updatedUser = req.body.user;
    const { filter } = makeCompanyBasedQuery(req);
    const { _id } = updatedUser;
    if (!_id) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const isValid = verifyObjectIds([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    let filter2 = { _id };
    if (req.body.profileOnly === 'true') {
        const { userId } = req.user;
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
        foundUser.urId = await generateUrId(user);
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
    const keys = Object.keys(updatedUser);
    keys.forEach(key => {
        if (filter.companyId === 'superAdmin' && key !== 'companyId' && key !== 'userType' && key !== '_id') {
            foundUser[key] = updatedUser[key] || foundUser[key];
        }
        else if (foundUser[key] &&
            key !== 'password' &&
            key !== 'email' &&
            key !== 'phone' &&
            key !== 'companyId' &&
            key !== 'userType' &&
            key !== '_id') {
            foundUser[key] = updatedUser[key] || foundUser[key];
        }
    });
    const savedUserRes = await foundUser.save().catch((err) => err);
    if (savedUserRes instanceof Error) {
        const errResponse = handleMongooseErr(savedUserRes);
        return res.status(errResponse.status).send(errResponse);
    }
    req.body.user = savedUserRes;
    return next();
};
export const removeOneUser = async (req, res, next) => {
    const _id = req.body.userId || req.body._id;
    if (!_id) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const isValid = verifyObjectIds([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const found = await user.findOne({ _id })
        .populate([populatePhotos()])
        .lean();
    if (!found) {
        return res.status(404).send({ success: false, status: 404, err: 'not found' });
    }
    if (found) {
        if (found.userType === 'eUser') {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        if (found.photos) {
            const filesWithDir = found.photos.map(photo => ({
                _id: photo._id,
                url: photo.url
            }));
            await deleteAllFiles(filesWithDir);
        }
    }
    /* const deleted = await user
      .findOneAndDelete({ _id, }); */
    const updateRes = await user
        .updateOne({ _id }, { $set: { isDeleted: true } })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    addParentToLocals(res, _id, user.collection.collectionName, 'makeTrackEdit');
    return next();
};
export const removeManyUsers = async (req, res, next) => {
    const ids = req.body?.userIds?.length ? req.body.userIds : req.body._ids;
    const isValid = verifyObjectIds([...ids]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    let filesWithDir = [];
    const alltoDelete = await user.find({ _id: { $in: ids } })
        .populate([
        populateProfilePic(true),
        populateProfileCoverPic(true), populatePhotos(true), populateTrackEdit(), populateTrackView()
    ])
        .lean();
    for (const user of alltoDelete) {
        if (user.photos && user.photos?.length > 0) {
            filesWithDir = [...filesWithDir, ...user.photos];
        }
    }
    await deleteAllFiles(filesWithDir);
    const updateRes = await user
        .updateMany({ _id: { $in: ids } }, {
        $set: { isDeleted: true }
    })
        .catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    next();
};
export const socialLogin = (provider) => {
    return async (req, res) => {
        if (!req.user) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const userProp = req.user;
        mainLogger.debug(`sociallogin, 
    provider: ${provider}`);
        const foundUser = await user.findOne({ email: userProp.email });
        if (!foundUser) {
            const urId = await generateUrId(user);
            const newUser = new user({
                urId,
                fname: userProp.username || userProp.name,
                lname: userProp.name || userProp.username,
                phone: userProp.phone,
                email: userProp.email,
                admin: false,
                expireAt: '',
                verified: true,
                socialAuthFrameworks: [{ providerName: provider, id: userProp.id }],
                profilepic: {
                    url: userProp.photo
                },
                countryCode: +256
            });
            const nUserRes = await newUser.save().catch((err) => err);
            if (nUserRes instanceof Error) {
                const errResponse = handleMongooseErr(nUserRes);
                return res.status(errResponse.status).send(errResponse);
            }
            if (nUserRes && nUserRes._id) {
                addParentToLocals(res, nUserRes._id, user.collection.collectionName, 'makeTrackEdit');
            }
            return res.status(200).send({
                success: true,
                user: nUserRes.toAuthJSON()
            });
        }
        else {
            /* TODO const file: Partial<IfileMeta> = {
              url: userProp.photo
            };
      
            foundUser.profilePic = file; */
            const socialAuthFrameworks = foundUser.socialAuthFrameworks;
            const found = socialAuthFrameworks?.find(saf => saf.providerName === 'google');
            if (!found) {
                socialAuthFrameworks?.push({ providerName: 'google', id: userProp.id });
            }
            foundUser.socialAuthFrameworks = socialAuthFrameworks;
            const savedUserRes = await foundUser.save().catch((err) => err);
            if (savedUserRes instanceof Error) {
                const errResponse = handleMongooseErr(savedUserRes);
                return res.status(errResponse.status).send(errResponse);
            }
            const response = {
                success: true,
                user: foundUser.toAuthJSON()
            };
            return res.status(200).send(response);
        }
    };
};
userAuthRoutes.get('/authexpress2', requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { userId } = req.user;
    const isValid = verifyObjectId(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await userLean
        .findById(userId)
        .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
    ])
        // .populate({ path: 'companyId', model: companyLean })
        .lean()
        .select(userAuthSelect)
        .catch((err) => err);
    if (foundUser instanceof Error) {
        const errResponse = handleMongooseErr(foundUser);
        return res.status(errResponse.status).send(errResponse);
    }
    if (!foundUser) {
        const response = {
            success: false,
            err: 'Acccount does not exist!'
        };
        return res.status(401).send(response);
    }
    if (foundUser.blocked?.status === true) {
        const response = {
            success: false,
            err: `This Acccount has been blocked
                due to suspicious activities please contact,
                support`
        };
        return res.status(401).send(response);
    }
    const responseObj = await makeUserReturnObject(foundUser);
    responseObj.success = true;
    const nowResponse = {
        ...responseObj
    };
    return res.status(200).send(nowResponse);
});
userAuthRoutes.post('/login', async (req, res, next) => {
    // req.body.from = 'user'; // TODO remove this
    const { emailPhone, userType } = req.body;
    let filter2 = {};
    if (userType) {
        filter2 = { userType };
    }
    else {
        filter2 = { userType: { $ne: 'customer' } };
    }
    mainLogger.debug(`login attempt,
    emailPhone: ${emailPhone}, userType: ${userType}`);
    const { query, isPhone } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
    const foundUser = await user.findOne({ ...query, ...filter2 })
        .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
    ]);
    if (!foundUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    req.body.isPhone = isPhone;
    req.body.foundUser = foundUser;
    return next();
}, checkIpAndAttempt, userLoginRelegator, recoverAccountFactory);
userAuthRoutes.get('/authexpress', requireAuth, async (req, res, next) => {
    // req.body.from = 'user' // TODO;
    mainLogger.debug('authexpress');
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { userId } = req.user;
    const foundUser = await user.findOne({ _id: userId, ...{ userType: { $ne: 'customer' }, verified: true } })
        .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
    ]);
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
userAuthRoutes
    .post('/recover', async (req, res, next) => {
    const emailPhone = req.body.emailPhone;
    mainLogger.debug(`recover, 
    emailphone: ${emailPhone}`);
    const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
    const foundUser = await user.findOne({ ...query, ...{ userType: { $ne: 'customer' } } })
        .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
    ]);
    if (!foundUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    req.body.foundUser = foundUser;
    return next();
}, recoverAccountFactory);
userAuthRoutes.post('/confirm', async (req, res, next) => {
    const { _id, verifycode, useField } = req.body;
    mainLogger.debug(`verify, verifycode: ${verifycode}, useField: ${useField}`);
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
        .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
    ]);
    if (!foundUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    req.body.foundUser = foundUser;
    return next();
}, confirmAccountFactory);
userAuthRoutes.put('/resetpaswd', async (req, res, next) => {
    const { _id, verifycode } = req.body;
    mainLogger.debug(`resetpassword, 
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
        .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
    ]);
    if (!foundUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    req.body.foundUser = foundUser;
    return next();
}, resetAccountFactory);
userAuthRoutes.post('/manuallyverify/:userId', requireAuth, roleAuthorisation('users', 'update'), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { userId } = req.params;
    const { companyId } = req.user;
    const isValid = verifyObjectIds([userId, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!stockAuthConfig || !stockAuthConfig.localSettings || stockAuthConfig.localSettings.production) {
        return res.status(401).send({ success: false, er: 'unauthourized' });
    }
    const foundUser = await user
        .findOne({ _id: userId });
    if (!foundUser) {
        return res.status(401).send({
            success: false,
            err: 'Account does not exist'
        });
    }
    const updateRes = await user.updateOne({
        _id: userId
    }, {
        $set: {
            verified: true
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
userAuthRoutes.get('/login/facebook', passport.authenticate('facebook'));
userAuthRoutes.get('/login/google', passport.authenticate('google'));
userAuthRoutes.get('/oauth2/redirect/facebook', passport.authenticate('facebook'), socialLogin('facebook'), checkIpAndAttempt, userLoginRelegator);
userAuthRoutes.get('/oauth2/redirect/google', passport.authenticate('google'), socialLogin('google'), checkIpAndAttempt, userLoginRelegator);
userAuthRoutes.put('/updatepermissions/:_id', requireAuth, roleAuthorisation('users', 'update'), async (req, res) => {
    const { _id } = req.params;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    mainLogger.debug('updatepermissions');
    const foundUser = await user
        .findById(_id);
    if (!foundUser) {
        return res.status(401).send({
            success: false,
            err: 'Account does not exist'
        });
    }
    foundUser.permissions = req.body || foundUser.permissions;
    const savedRes = await foundUser.save().catch((err) => err);
    if (savedRes instanceof Error) {
        const errResponse = handleMongooseErr(savedRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(100).send({ success: true });
});
userAuthRoutes.get('/one/:urIdOr_id', requireAuth, roleAuthorisation('users', 'read'), async (req, res) => {
    const { urIdOr_id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const filterwithId = verifyObjectId(urIdOr_id) ? { _id: urIdOr_id } : { urId: urIdOr_id };
    /* if (companyId === 'superAdmin' && companyIdParam !== 'undefined') {
    companyId = companyIdParam;
  } else {
    companyId = companyId;
  } */
    /* if (companyId || companyId !== 'superAdmin') {
    const isValid = verifyObjectId(companyId);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
  } */
    const oneUser = await userLean
        .findOne({ ...filterwithId, ...filter })
        .populate([
        populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
    ])
        .populate({ path: 'companyId', model: companyLean })
        .lean();
    if (!oneUser || (oneUser && oneUser.blocked)) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    if (filter.companyId &&
        filter.companyId !== 'all' &&
        filter.companyId !== 'undefined' &&
        oneUser.companyId &&
        oneUser.companyId.blocked) {
        return res.status(404).send({ success: false, err: 'not found' });
    }
    addParentToLocals(res, oneUser._id, user.collection.collectionName, 'trackDataView');
    return res.status(200).send(oneUser);
});
userAuthRoutes.get('/all/:offset/:limit', requireAuth, requireActiveCompany, roleAuthorisation('users', 'read'), async (req, res) => {
    const { filter } = makeCompanyBasedQuery(req);
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;
    mainLogger.info('filter is ', filter);
    const all = await Promise.all([
        userLean
            .find({ verified: true, userType: { $ne: 'company' }, ...filter })
            .sort({ fname: 1 })
            .limit(Number(currLimit))
            .skip(Number(currOffset))
            .populate([
            populateProfilePic(), populateProfileCoverPic(), populatePhotos(), populateTrackEdit(), populateTrackView()
        ])
            .populate({ path: 'companyId', model: companyLean, select: { name: 1, blocked: 1 } })
            .lean(),
        userLean.countDocuments({ verified: true, userType: { $ne: 'company' }, ...filter })
    ]);
    const filteredUsers = all[0].filter(data => {
        if (filter.companyId && filter.companyId !== 'all' && filter.companyId !== 'undefined') {
            return !data.companyId.blocked;
        }
        return true;
    });
    const response = {
        count: all[1],
        data: filteredUsers
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, user.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
userAuthRoutes.post('/filter', requireAuth, requireActiveCompany, roleAuthorisation('users', 'read'), async (req, res) => {
    const { propSort, returnEmptyArr } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const filter = constructFiltersFromBody(req);
    // TODO only admins can access verified users, blocked users
    const aggCursor = userLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...lookupPhotos(),
        ...lookupTrackEdit(),
        ...lookupTrackView(),
        ...lookupFacet(offset, limit, propSort, returnEmptyArr)
    ]);
    const dataArr = [];
    for await (const data of aggCursor) {
        dataArr.push(data);
    }
    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;
    const response = {
        count,
        data: all
    };
    for (const val of all) {
        addParentToLocals(res, val._id, user.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
userAuthRoutes.post('/add', requireAuth, roleAuthorisation('users', 'create'), addUser, (req, res) => {
    return res.status(200).send({ success: true });
});
userAuthRoutes.post('/add/img', requireAuth, roleAuthorisation('users', 'create'), uploadFiles, appendBody, saveMetaToDb, addUser, (req, res) => {
    return res.status(200).send({ success: true });
});
userAuthRoutes.put('/update', requireAuth, requireActiveCompany, roleAuthorisation('users', 'update'), updateUserBulk, (req, res) => {
    return res.status(200).send({ success: true });
});
userAuthRoutes.post('/update/img', requireAuth, requireActiveCompany, roleAuthorisation('users', 'update'), uploadFiles, appendBody, saveMetaToDb, updateUserBulk, (req, res) => {
    return res.status(200).send({ success: true });
});
userAuthRoutes.put('/delete/many', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), removeManyUsers, (req, res) => {
    return res.status(200).send({ success: true });
});
userAuthRoutes.put('/delete/one', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), removeOneUser, (req, res) => {
    return res.status(200).send({ success: true });
});
userAuthRoutes.put('/delete/images', requireAuth, requireActiveCompany, roleAuthorisation('users', 'delete'), deleteFiles(true), async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const filesWithDir = req.body.filesWithDir;
    const { companyId } = req.user;
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedUser = req.body.user;
    const { _id } = updatedUser;
    if (_id) {
        const isValid = verifyObjectIds([_id]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
    }
    const isValid = verifyObjectIds([companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user
        .findOne({ _id });
    if (!foundUser) {
        return res.status(404).send({ success: false, err: 'item not found' });
    }
    const photos = foundUser.photos;
    const filesWithDirIds = filesWithDir
        .map(val => val._id);
    const updateRes = await user.updateOne({
        _id
    }, {
        $set: {
            photos: photos?.filter((p) => {
                if (typeof p === 'string') {
                    return !filesWithDirIds.includes(p);
                }
                else {
                    return !filesWithDirIds.includes(p._id);
                }
            }),
            profilePic: foundUser.photos?.find(p => p === foundUser.profilePic),
            profileCoverPic: foundUser.photos?.find(p => p === foundUser.profileCoverPic)
        }
    }).catch((err) => err);
    if (updateRes instanceof Error) {
        const errResponse = handleMongooseErr(updateRes);
        return res.status(errResponse.status).send(errResponse);
    }
    return res.status(200).send({ success: true });
});
userAuthRoutes.get('/existsemailphone/:emailPhone', async (req, res) => {
    const { emailPhone } = req.params;
    const { query } = determineIfIsPhoneAndMakeFilterObj(emailPhone);
    const foundUser = await user.findOne({ ...query }).lean().select({ _id: 1 });
    return res.status(401).send({ success: true, exists: Boolean(foundUser) });
});
//# sourceMappingURL=user.routes.js.map