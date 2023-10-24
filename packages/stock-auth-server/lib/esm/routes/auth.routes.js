/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getLogger } from 'log4js';
import { checkIfAdmin } from '../controllers/admin.controller';
import { generateToken, sendTokenEmail, sendTokenPhone, setUserInfo, validateEmail, validatePhone } from '../controllers/universial.controller';
import { user, userAuthSelect, userLean } from '../models/user.model';
import { appendBody, deleteFiles, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, uploadFiles, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { checkIpAndAttempt } from '../controllers/login.controller';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
const passport = require('passport');
/** */
export const authRoutes = express.Router();
const authLogger = getLogger('routes/auth');
/** */
export const userLoginRelegator = async (req, res) => {
    let isPhone;
    const { emailPhone, passwd, from } = req.body;
    const mainQuery = { verified: true };
    let query;
    if (isNaN(emailPhone)) {
        query = { ...mainQuery, email: emailPhone };
        isPhone = false;
    }
    else {
        query = { ...mainQuery, phone: emailPhone };
        isPhone = true;
    }
    const foundUser = await userLean
        .findOne(query)
        .lean()
        .select(userAuthSelect)
        .catch(err => {
        authLogger.error('Find user projection err', err);
        return null;
    });
    if (from === 'admin') {
        let hasAtleatsOnePerm = false;
        for (const key of Object.keys(foundUser.permissions)) {
            if (key !== 'buyer' && foundUser.permissions[key]) {
                hasAtleatsOnePerm = true;
            }
        }
        if (!hasAtleatsOnePerm) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
    }
    else {
        // delete user.password; //we do not want to send back password
        const userInfo = setUserInfo(foundUser._id, foundUser.permissions);
        const token = generateToken(userInfo, '1d', req.app.locals.stockAuthServer.lAuth.jwtSecret);
        const nowResponse = {
            success: true,
            user: foundUser,
            token
        };
        return res.status(200).send(nowResponse);
    }
};
authRoutes.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRoutes.get('/authexpress', requireAuth, async (req, res) => {
    const { userId, permissions } = req.user;
    const keys = Object.keys(permissions);
    let isAdminMain = true;
    // loop over to see if any perm is false, thus is not main admin
    for (const key of keys) {
        if (key !== 'buyer') {
            isAdminMain = permissions[key];
        }
    }
    if (isAdminMain) {
        const admin = {
            name: 'admin',
            admin: true,
            permissions
        };
        return res.status(200).send({ user: admin });
    }
    const isValid = verifyObjectId(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await userLean
        .findById(userId)
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
    const userInfo = setUserInfo(foundUser._id, foundUser.permissions);
    const token = generateToken(userInfo, '1d', req.app.locals.stockAuthServer.lAuth.jwtSecret);
    const nowResponse = {
        success: true,
        user: foundUser,
        token
    };
    return res.status(200).send(nowResponse);
});
authRoutes.post('/login/admin', async (req, res, next) => {
    const { emailPhone, passwd } = req.body;
    req.body.from = 'admin';
    authLogger.debug(`Admin login attempt,
    emailPhone: ${emailPhone}`);
    const isAdmin = await checkIfAdmin(emailPhone, passwd, req.app.locals.stockAuthServer.aAuth.processadminID, req.app.locals.stockAuthServer.aAuth.password);
    if (isAdmin.success === true) {
        const userInfo = setUserInfo('admin', isAdmin.user?.permissions);
        const token = generateToken(userInfo, '1d', req.app.locals.stockAuthServer.lAuth.jwtSecret);
        isAdmin.token = token;
        return res.status(200).send(isAdmin);
    }
    /* else {
      return res.status(401).send('unauthorised');
    }*/
    return next();
}, checkIpAndAttempt, userLoginRelegator);
authRoutes.post('/login', (req, res, next) => {
    req.body.from = 'user';
    const { emailPhone } = req.body;
    authLogger.debug(`login attempt,
    emailPhone: ${emailPhone}`);
    return next();
}, checkIpAndAttempt, userLoginRelegator);
authRoutes.post('/signup', async (req, res) => {
    const { emailPhone, firstName, lastName } = req.body;
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
    if (foundUser) {
        const phoneOrEmail = isPhone ? 'phone' : 'email';
        const response = {
            success: false,
            err: phoneOrEmail +
                ', already exists, try using another'
        };
        return res.status(200).send(response);
    }
    const count = await user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = makeUrId(Number(count[0]?.urId || '0'));
    const permissions = {
        orders: false,
        payments: false,
        users: false,
        items: false,
        faqs: false,
        videos: false,
        printables: false,
        buyer: true
    };
    const expireAt = Date.now();
    const newUser = new user({
        urId,
        fname: firstName,
        lname: lastName,
        phone,
        email,
        password: passwd,
        permissions,
        expireAt,
        countryCode: +256
    });
    return newUser.save().then((newuser) => {
        const done = async () => {
            let response;
            const type = 'token'; // note now is only token but build a counter later to make sur that the token and link methods are shared
            if (isPhone) {
                response = await sendTokenPhone(newuser);
            }
            else {
                response = await sendTokenEmail(req.app, newuser, type, req.app.locals.stockAuthServer.localEnv.appOfficialName);
            }
            if (!response.success) {
                newuser.remove(); // TODO
                return res.status(200).send(response);
            }
            // TODO notify adminpanel
            /** if (NotificationController.stn.users) {
              const actions: Iactionwithall[] = [{
                operation: 'view',
                url: notifConfig + '/users',
                action: '',
                title: 'New User'
              }];
             
              const notification: Imainnotification = {
                actions,
                userId: newuser._id,
                title: 'New User',
                body: 'A new user has joined, foollow link to engage recent users',
                icon: '',
                notifType: 'users',
                // photo: string;
                expireAt: '200000'
              };
             
              const capableUsers = await user.find({})
                .lean().select({ permissions: 1 });
              const ids: string[] = [];
             
              for (const cuser of capableUsers) {
                if (cuser.permissions.users) {
                  ids.push(cuser._id);
                }
              }
             
              const notifFilters = { id: { $in: ids } };
              await createNotifications({
                options: notification,
                filters: notifFilters
              });
            }*/
            return res.status(200).send(response);
        };
        return done();
    }).catch(err => {
        authLogger.error(`mongosse registration 
    validation error, ${err}`);
        let response = {
            success: false
        };
        if (err && err.errors) {
            response.err = stringifyMongooseErr(err.errors);
        }
        else {
            response.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
        return res.status(403).send(response);
    });
});
authRoutes.post('recover', async (req, res) => {
    const { appOfficialName } = req.localEnv;
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
    const foundUser = await user.findOne(query);
    let response = { success: false };
    if (!foundUser) {
        response = {
            success: false,
            err: 'account does not exist'
        };
        return res.status(401).send(response);
    }
    if (emailOrPhone === 'phone') {
        response = await sendTokenPhone(foundUser);
    }
    else {
        const type = '_link';
        response = await sendTokenEmail(req.app, foundUser, type, appOfficialName);
    }
    return res.status(200).send(response);
});
authRoutes.post('/confirm', async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _id = req.body._id;
    const verifycode = req.body.verifycode;
    const how = req.body.nowHow;
    const type = req.body.type;
    authLogger.debug(`verify, verifycode: ${verifycode}, how: ${how}`);
    let response;
    if (how === 'phone') {
        response = await validatePhone(_id, 'signup', verifycode, null);
    }
    else {
        response = await validateEmail(_id, type, 'signup', verifycode, null);
    }
    return res.status(response.status).send(response.response);
});
authRoutes.put('/resetpaswd', async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _id = req.body._id;
    const verifycode = req.body.verifycode;
    const how = req.body.how;
    const passw = req.body.password;
    authLogger.debug(`resetpassword, 
    verifycode: ${verifycode}`);
    let response;
    if (how === 'phone') {
        response = await validatePhone(_id, 'password', verifycode, passw);
    }
    else {
        const type = '_code';
        response = await validateEmail(_id, type, 'password', verifycode, passw);
    }
    return res.status(response.status).send(response.response);
});
authRoutes.post('/manuallyverify/:userId', async (req, res) => {
    const { userId } = req.params;
    const isValid = verifyObjectId(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    if (!req.app.locals.stockAuthServer || !req.app.locals.stockAuthServer.localEnv || req.app.locals.stockAuthServer.localEnv.production) {
        return res.status(401).send({ success: false, er: 'unauthourized' });
    }
    const foundUser = await user
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
authRoutes.post('/sociallogin', async (req, res) => {
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
            return errResponse;
        });
        if (errResponse) {
            return res.status(403).send(errResponse);
        }
        else {
            return res.status(200).send({
                success: true,
                user: nUser.toAuthJSON() // TODO
            });
        }
    }
    else {
        foundUser.name = credentials.name;
        foundUser.profilepic = credentials.profilepic;
        let status = 200;
        let response = { success: true };
        await foundUser.save().catch(err => {
            status = 403;
            let errResponse = {
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
authRoutes.put('/updateprofile/:formtype', requireAuth, async (req, res) => {
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
            foundUser['comparePassword'](userdetails.passwd, function (err, isMatch) {
                if (err) {
                    status = 401;
                    success = false;
                    error = 'invalid password';
                    // throw err;
                }
                ;
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
            foundUser['comparePassword'](userdetails.passwd, function (err, isMatch) {
                if (err) {
                    status = 200;
                    success = false;
                    error = 'invalid password';
                }
                ;
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
            foundUser['comparePassword'](userdetails.oldPassword, function (err, isMatch) {
                if (err) {
                    status = 200;
                    success = false;
                    error = 'invalid password';
                }
                ;
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
            let errResponse = {
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
authRoutes.post('/updateprofileimg', requireAuth, uploadFiles, appendBody, deleteFiles, async (req, res) => {
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
    foundUser.photo = req.body.newFiles[0];
    let status = 200;
    let response = { success: true };
    await foundUser.save().catch((err) => {
        status = 403;
        let errResponse = {
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
authRoutes.put('/updatepermissions/:userId', requireAuth, roleAuthorisation('users'), async (req, res) => {
    const { userId } = req.params;
    authLogger.debug('updatepermissions');
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
    foundUser.permissions = req.body.permissions || foundUser.permissions;
    let status = 200;
    let response = { success: true };
    await foundUser.save().catch(err => {
        status = 403;
        let errResponse = {
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
authRoutes.put('/blockunblock', requireAuth, roleAuthorisation('users'), async (req, res) => {
    const { userId } = req.user;
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
        let errResponse = {
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
authRoutes.put('/addupdateaddr/:userId', requireAuth, async (req, res) => {
    const { userId } = req.params;
    authLogger.debug('updatepermissions');
    const isValid = verifyObjectId(userId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const foundUser = await user
        .findByIdAndUpdate(userId);
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
        let errResponse = {
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
authRoutes.get('/getoneuser/:urId', requireAuth, roleAuthorisation('users'), async (req, res) => {
    const { urId } = req.params;
    const oneUser = await userLean
        .findOne({ urId })
        .lean();
    return res.status(200).send(oneUser);
});
authRoutes.get('/getusers/:where/:offset/:limit', requireAuth, roleAuthorisation('users'), async (req, res) => {
    const { getusers, where } = req.params;
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const currOffset = offset === 0 ? 0 : offset;
    const currLimit = limit === 0 ? 1000 : limit;
    let filter;
    switch (where) {
        case 'manual':
            filter = {
                manuallyAdded: true
            };
            break;
        case 'auto':
            filter = {
                manuallyAdded: false
            };
            break;
        default:
            filter = {};
            break;
    }
    const faqs = await userLean
        .find(filter)
        .sort({ firstName: 1 })
        .limit(Number(currLimit))
        .skip(Number(currOffset))
        .lean();
    return res.status(200).send(faqs);
});
authRoutes.post('/adduser', requireAuth, roleAuthorisation('users'), async (req, res) => {
    const userData = req.body.user;
    const count = await user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    userData.urId = makeUrId(Number(count[0]?.urId || '0'));
    const newUser = new user(userData);
    let status = 200;
    let response = { success: true, };
    const savedUser = await newUser.save().catch((err) => {
        status = 403;
        let errResponse = {
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
            userId: savedUser._id // TODO add to types
        };
    }
    return res.status(status).send(response);
});
authRoutes.post('/adduserimg', requireAuth, roleAuthorisation('users'), uploadFiles, appendBody, async (req, res) => {
    const userData = req.body.user;
    if (req.body.newFiles) {
        userData.photo = req.body.newFiles[0];
    }
    const count = await user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    userData.urId = makeUrId(Number(count[0]?.urId || '0'));
    const newUser = new user(userData);
    let status = 200;
    let response = { success: true };
    const savedUser = await newUser.save().catch((err) => {
        status = 403;
        let errResponse = {
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
            userId: savedUser._id // TODO add to types
        };
    }
    return res.status(status).send(response);
});
authRoutes.put('/updateuserbulk', requireAuth, roleAuthorisation('items'), async (req, res) => {
    const updatedUser = req.body.user;
    const { _id } = updatedUser;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    ;
    const foundUser = await user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!foundUser) {
        return res.status(404).send({ success: false });
    }
    if (!foundUser.urId) {
        const count = await user
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundUser.urId = makeUrId(Number(count[0]?.urId || '0'));
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
        let errResponse = {
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
authRoutes.post('/updateuserbulkimg', requireAuth, roleAuthorisation('products'), uploadFiles, appendBody, async (req, res) => {
    const updatedUser = req.body.user;
    const { _id } = updatedUser;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, err: 'unauthourised' });
    }
    ;
    const foundUser = await user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .findByIdAndUpdate(_id);
    if (!foundUser) {
        return res.status(404).send({ success: false });
    }
    if (!foundUser.urId) {
        const count = await user
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        foundUser.urId = makeUrId(Number(count[0]?.urId || '0'));
    }
    foundUser.photo = req.body.newFiles[0];
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
        let errResponse = {
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
authRoutes.put('/deletemany', requireAuth, roleAuthorisation('users'), deleteFiles, async (req, res) => {
    const { ids } = req.body;
    const isValid = verifyObjectIds(ids);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await user
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
authRoutes.put('/deleteone', requireAuth, roleAuthorisation('users'), deleteFiles, async (req, res) => {
    const { _id } = req.body;
    const isValid = verifyObjectId(_id);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const deleted = await user
        .findByIdAndDelete(_id);
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=auth.routes.js.map