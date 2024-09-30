"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialLogin = exports.removeManyUsers = exports.removeOneUser = exports.updateUserBulk = exports.addUser = exports.userLoginRelegator = exports.signupFactorRelgator = exports.canRemoveOneUser = exports.determineUsersToRemove = exports.determineUserToRemove = exports.userAuthRoutes = void 0;
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
const determineUserToRemove = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
model, linkedModels) => {
    return async (req, res, next) => {
        const { _id } = req.body;
        const isValid = (0, stock_universal_server_1.verifyObjectId)(_id);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const found = await model.findOne({ _id });
        if (!found || !found.user) {
            return res.status(404).send({ msg: 'User not found', status: 404 });
        }
        const canRemove = await (0, exports.canRemoveOneUser)(found.user, linkedModels);
        if (!canRemove.success) {
            return res.status(401).send({ ...canRemove, status: 401 });
        }
        req.body.userId = found.user;
        next();
    };
};
exports.determineUserToRemove = determineUserToRemove;
const determineUsersToRemove = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
model, linkedModels) => {
    return async (req, res, next) => {
        const { _ids } = req.body;
        const isValid = (0, stock_universal_server_1.verifyObjectIds)(_ids);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const manay = await model.find({ _id: { $in: _ids } });
        const promises = manay.map(async (val) => {
            const canRemove = await (0, exports.canRemoveOneUser)(val.user, linkedModels);
            return Promise.resolve({ ...canRemove, ...val });
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
exports.determineUsersToRemove = determineUsersToRemove;
const canRemoveOneUser = async (id, modelsCred) => {
    const promises = modelsCred.map(async (val) => {
        const found = await val.model.findOne({ [val.field]: id });
        let toReturnMsg;
        if (found) {
            toReturnMsg = val.errMsg;
        }
        else {
            toReturnMsg = null;
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
exports.canRemoveOneUser = canRemoveOneUser;
const signupFactorRelgator = async (req, res, next) => {
    authLogger.info('signupFactorRelgator');
    const { emailPhone } = req.body;
    const userType = req.body.userType || 'eUser';
    const passwd = req.body.passwd;
    let phone;
    let email;
    let query;
    let isPhone;
    authLogger.debug(`signup, 
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
        const companyUrId = await (0, stock_universal_server_1.generateUrId)(company_model_1.companyMain);
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
    const urId = await (0, stock_universal_server_1.generateUrId)(user_model_1.user);
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
    // note now is only token but build a counter later to make sure that the token and link methods are shared
    const type = 'token';
    if (isPhone) {
        response = await (0, universial_1.sendTokenPhone)(saved);
    }
    else {
        response = await (0, universial_1.sendTokenEmail)(saved, type, stock_auth_local_1.stockAuthConfig.localSettings.appOfficialName);
    }
    if (!response.success) {
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
const userLoginRelegator = async (req, res, next) => {
    authLogger.info('userLoginRelegator');
    const { emailPhone, userType } = req.body;
    const { query } = (0, auth_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    let { foundUser } = req.body;
    let filter2 = {};
    if (userType) {
        filter2 = { userType };
    }
    else {
        filter2 = { userType: { $ne: 'customer' } };
    }
    if (!foundUser) {
        foundUser = await user_model_1.userLean
            .findOne({ ...query, ...filter2 })
            .populate([
            (0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()
        ])
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
const reoveUploadedFiles = async (parsed, directlyRemove) => {
    authLogger.info('reoveUploadedFiles');
    let _ids = [];
    if (parsed.profilePic) {
        _ids.push(parsed.profilePic);
    }
    if (parsed.coverPic) {
        _ids.push(parsed.coverPic);
    }
    if (parsed.newPhotos) {
        _ids = [..._ids, ...parsed.newPhotos];
    }
    if (_ids.length === 0) {
        return true;
    }
    const filesWithDir = await stock_universal_server_1.fileMetaLean.find({ _id: { $in: _ids } }).lean().select({ _id: 1, url: 1 });
    if (filesWithDir && filesWithDir.length > 0) {
        await (0, stock_universal_server_1.deleteAllFiles)(filesWithDir, directlyRemove);
    }
    return true;
};
const addUser = async (req, res, next) => {
    authLogger.info('adding user');
    const userData = req.body.user;
    const parsed = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
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
    userData.urId = await (0, stock_universal_server_1.generateUrId)(user_model_1.user);
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
        req.body.user = savedUser;
        return next();
    }
    return res.status(status).send(response);
};
exports.addUser = addUser;
const updateUserBulk = async (req, res, next) => {
    const updatedUser = req.body.user;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { _id } = updatedUser;
    if (!_id) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    let filter2 = { _id };
    if (req.body.profileOnly === 'true') {
        const { userId } = req.user;
        filter2 = { user: userId };
    }
    const parsed = req.body;
    const foundUser = await user_model_1.user
        .findOne({ ...filter, ...filter2 });
    if (!foundUser) {
        if (parsed.newPhotos) {
            await (0, stock_universal_server_1.deleteAllFiles)(parsed.newPhotos, true);
        }
        return res.status(404).send({ success: false });
    }
    if (!foundUser.urId) {
        foundUser.urId = await (0, stock_universal_server_1.generateUrId)(user_model_1.user);
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
        if (filter.companyId === 'superAdmin' && key !== 'companyId' && key !== 'userType' && key !== '_id') {
            foundUser[key] = updatedUser[key] || foundUser[key];
        }
        else if (foundUser[key] &&
            key !== 'password' &&
            key !== 'email' &&
            key !== 'phone' &&
            key !== 'companyId' &&
            key !== 'userType') {
            foundUser[key] = updatedUser[key] || foundUser[key];
        }
    });
    const status = 200;
    let response = { success: true };
    const savedUser = await foundUser.save().catch((err) => {
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
    if (response.success) {
        req.body.user = savedUser;
        return next();
    }
    return res.status(status).send(response);
};
exports.updateUserBulk = updateUserBulk;
const removeOneUser = async (req, res, next) => {
    const _id = req.body.userId || req.body._id;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const found = await user_model_1.user.findOne({ _id })
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
      .findOneAndDelete({ _id, }); */
    const deleted = await user_model_1.user
        .updateOne({ _id }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        (0, stock_universal_server_1.addParentToLocals)(res, _id, user_model_1.user.collection.collectionName, 'makeTrackEdit');
        return next();
    }
    else {
        return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
};
exports.removeOneUser = removeOneUser;
const removeManyUsers = async (req, res, next) => {
    const ids = req.body?.userIds.length ? req.body.userIds : req.body._ids;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([...ids]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    let filesWithDir;
    const alltoDelete = await user_model_1.user.find({ _id: { $in: ids } })
        .populate([
        (0, query_1.populateProfilePic)(true),
        (0, query_1.populateProfileCoverPic)(true), (0, query_1.populatePhotos)(true), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()
    ])
        .lean();
    for (const user of alltoDelete) {
        if (user.photos?.length > 0) {
            filesWithDir = [...filesWithDir, ...user.photos];
        }
    }
    await (0, stock_universal_server_1.deleteAllFiles)(filesWithDir);
    /* const deleted = await user
        .deleteMany({  _id: { $in: newUserIds } })
        .catch(err => {
          localUserRoutesLogger.error('deletemany - err: ', err);
  
          return null;
        }); */
    const deleted = await user_model_1.user
        .updateMany({ _id: { $in: ids } }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        authLogger.error('deletemany - err: ', err);
        return null;
    });
    if (!Boolean(deleted)) {
        return res.status(405).send({
            success: Boolean(deleted), err: 'could not delete selected items, try again in a while'
        });
    }
    next();
};
exports.removeManyUsers = removeManyUsers;
const socialLogin = (provider) => {
    return async (req, res) => {
        const userProp = req.user;
        authLogger.debug(`sociallogin, 
    provider: ${provider}`);
        const foundUser = await user_model_1.user.findOne({ email: userProp.email });
        if (!foundUser) {
            const urId = await (0, stock_universal_server_1.generateUrId)(user_model_1.user);
            const newUser = new user_model_1.user({
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
            const file = {
                url: userProp.photo
            };
            foundUser.profilePic = file;
            const socialAuthFrameworks = foundUser.socialAuthFrameworks;
            const found = socialAuthFrameworks.find(saf => saf.providerName === 'google');
            if (!found) {
                socialAuthFrameworks.push({ providerName: 'google', id: userProp.id });
            }
            foundUser.socialAuthFrameworks = socialAuthFrameworks;
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
    };
};
exports.socialLogin = socialLogin;
exports.userAuthRoutes.get('/authexpress2', stock_universal_server_1.requireAuth, async (req, res) => {
    const { userId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user_model_1.userLean
        .findById(userId)
        .populate([
        (0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()
    ])
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
    // req.body.from = 'user'; // TODO remove this
    const { emailPhone, userType } = req.body;
    let filter2 = {};
    if (userType) {
        filter2 = { userType };
    }
    else {
        filter2 = { userType: { $ne: 'customer' } };
    }
    authLogger.debug(`login attempt,
    emailPhone: ${emailPhone}, userType: ${userType}`);
    const { query, isPhone } = (0, auth_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    const foundUser = await user_model_1.user.findOne({ ...query, ...filter2 })
        .populate([
        (0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()
    ]);
    if (!foundUser) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    req.body.isPhone = isPhone;
    req.body.foundUser = foundUser;
    return next();
}, auth_1.checkIpAndAttempt, exports.userLoginRelegator, auth_1.recoverAccountFactory);
exports.userAuthRoutes.get('/authexpress', stock_universal_server_1.requireAuth, async (req, res, next) => {
    // req.body.from = 'user' // TODO;
    authLogger.debug('authexpress');
    const { userId } = req.user;
    const foundUser = await user_model_1.user.findOne({ _id: userId, ...{ userType: { $ne: 'customer' }, verified: true } })
        .populate([
        (0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()
    ]);
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
exports.userAuthRoutes
    .post('/recover', async (req, res, next) => {
    const emailPhone = req.body.emailPhone;
    authLogger.debug(`recover, 
    emailphone: ${emailPhone}`);
    const { query } = (0, auth_1.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    const foundUser = await user_model_1.user.findOne({ ...query, ...{ userType: { $ne: 'customer' } } })
        .populate([
        (0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()
    ]);
    req.body.foundUser = foundUser;
    return next();
}, auth_1.recoverAccountFactory);
exports.userAuthRoutes.post('/confirm', async (req, res, next) => {
    const { _id, verifycode, useField } = req.body;
    authLogger.debug(`verify, verifycode: ${verifycode}, useField: ${useField}`);
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
        .populate([
        (0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()
    ]);
    req.body.foundUser = foundUser;
    return next();
}, auth_1.confirmAccountFactory);
exports.userAuthRoutes.put('/resetpaswd', async (req, res, next) => {
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
        .populate([
        (0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()
    ]);
    req.body.foundUser = foundUser;
    return next();
}, auth_1.resetAccountFactory);
exports.userAuthRoutes.post('/manuallyverify/:userId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), async (req, res) => {
    const { userId } = req.params;
    const { companyId } = req.user;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!stock_auth_local_1.stockAuthConfig || !stock_auth_local_1.stockAuthConfig.localSettings || stock_auth_local_1.stockAuthConfig.localSettings.production) {
        return res.status(401).send({ success: false, er: 'unauthourized' });
    }
    const foundUser = await user_model_1.user
        .findOneAndUpdate({ _id: userId });
    if (!foundUser) {
        return res.status(401).send({
            success: false,
            err: 'Account does not exist'
        });
    }
    foundUser.verified = true;
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.get('/login/facebook', passport.authenticate('facebook'));
exports.userAuthRoutes.get('/login/google', passport.authenticate('google'));
exports.userAuthRoutes.get('/oauth2/redirect/facebook', passport.authenticate('facebook'), (0, exports.socialLogin)('facebook'), auth_1.checkIpAndAttempt, exports.userLoginRelegator);
exports.userAuthRoutes.get('/oauth2/redirect/google', passport.authenticate('google'), (0, exports.socialLogin)('google'), auth_1.checkIpAndAttempt, exports.userLoginRelegator);
exports.userAuthRoutes.put('/updatepermissions/:_id', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), async (req, res) => {
    const { _id } = req.params;
    const isValid = (0, stock_universal_server_1.verifyObjectId)(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    authLogger.debug('updatepermissions');
    const foundUser = await user_model_1.user
        .findById(_id);
    if (!foundUser) {
        return res.status(401).send({
            success: false,
            err: 'Account does not exist'
        });
    }
    foundUser.permissions = req.body || foundUser.permissions;
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
exports.userAuthRoutes.get('/one/:urId', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { urId } = req.params;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // let companyId: string;
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
    const oneUser = await user_model_1.userLean
        .findOne({ urId, ...filter })
        .populate([
        (0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()
    ])
        .populate({ path: 'companyId', model: company_model_1.companyLean })
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
    (0, stock_universal_server_1.addParentToLocals)(res, oneUser._id, user_model_1.user.collection.collectionName, 'trackDataView');
    return res.status(200).send(oneUser);
});
exports.userAuthRoutes.get('/all/:offset/:limit', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;
    authLogger.info('filter is ', filter);
    const all = await Promise.all([
        user_model_1.userLean
            .find({ verified: true, userType: { $ne: 'company' }, ...filter })
            .sort({ fname: 1 })
            .limit(Number(currLimit))
            .skip(Number(currOffset))
            .populate([
            (0, query_1.populateProfilePic)(), (0, query_1.populateProfileCoverPic)(), (0, query_1.populatePhotos)(), (0, query_1.populateTrackEdit)(), (0, query_1.populateTrackView)()
        ])
            .populate({ path: 'companyId', model: company_model_1.companyLean, select: { name: 1, blocked: 1 } })
            .lean(),
        user_model_1.userLean.countDocuments({ verified: true, userType: { $ne: 'company' }, ...filter })
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, user_model_1.user.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.userAuthRoutes.post('/filter', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'read'), async (req, res) => {
    const { propSort } = req.body;
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.body.offset, req.body.limit);
    const filter = (0, stock_universal_server_1.constructFiltersFromBody)(req);
    const aggCursor = user_model_1.userLean.aggregate([
        {
            $match: {
                $and: [
                    // { status: 'pending' },
                    ...filter
                ]
            }
        },
        ...(0, stock_universal_server_1.lookupTrackEdit)(),
        ...(0, stock_universal_server_1.lookupTrackView)(),
        {
            $facet: {
                data: [...(0, stock_universal_server_1.lookupSort)(propSort), ...(0, stock_universal_server_1.lookupOffset)(offset), ...(0, stock_universal_server_1.lookupLimit)(limit)],
                total: [{ $count: 'count' }]
            }
        },
        {
            $unwind: {
                path: '$total',
                preserveNullAndEmptyArrays: true
            }
        }
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
        (0, stock_universal_server_1.addParentToLocals)(res, val._id, user_model_1.user.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
exports.userAuthRoutes.post('/add', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), exports.addUser, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.post('/add/img', stock_universal_server_1.requireAuth, (0, stock_universal_server_1.roleAuthorisation)('users', 'create'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, exports.addUser, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.put('/update', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), exports.updateUserBulk, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.post('/update/img', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'update'), stock_universal_server_1.uploadFiles, stock_universal_server_1.appendBody, stock_universal_server_1.saveMetaToDb, exports.updateUserBulk, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.put('/delete/many', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), exports.removeManyUsers, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.put('/delete/one', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), exports.removeOneUser, (req, res) => {
    return res.status(200).send({ success: true });
});
exports.userAuthRoutes.put('/delete/images', stock_universal_server_1.requireAuth, company_auth_1.requireActiveCompany, (0, stock_universal_server_1.roleAuthorisation)('users', 'delete'), (0, stock_universal_server_1.deleteFiles)(true), async (req, res) => {
    const filesWithDir = req.body.filesWithDir;
    const { companyId } = req.user;
    if (filesWithDir && !filesWithDir.length) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const updatedUser = req.body.user;
    const { _id } = updatedUser;
    const isValid = (0, stock_universal_server_1.verifyObjectIds)([_id, companyId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user_model_1.user
        .findOneAndUpdate({ _id });
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