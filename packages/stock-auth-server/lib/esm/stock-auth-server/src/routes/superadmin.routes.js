/**
 * This file contains the authentication routes for the stock-auth-server package.
 * It exports the superAdminRoutes router and userLoginRelegator function.
 * It also imports various controllers and models from the same package and other packages.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getLogger } from 'log4js';
import { generateToken, sendTokenEmail, sendTokenPhone, setUserInfo } from '../controllers/universial.controller';
import { user } from '../models/user.model';
import { makeUrId, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import { stockAuthConfig } from '../stock-auth-local';
import { companyMain } from '../models/company.model';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
const passport = require('passport');
/**
 * Router for super admin routes.
 */
export const superAdminRoutes = express.Router();
/**
 * Logger for authentication routes.
 */
const authLogger = getLogger('routes/auth');
/**
 * Handles the login and registration process for superadmin users.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A Promise that resolves to void.
 */
export const loginFactorRelgator = async (req, res, next) => {
    const { emailPhone } = req.body.user;
    const from = req.body.from;
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
    let foundUser;
    if (from === 'company') {
        foundUser = await companyMain.findOne(query);
    }
    else {
        foundUser = await user.findOne(query);
    }
    if (foundUser) {
        const phoneOrEmail = isPhone ? 'phone' : 'email';
        const response = {
            success: false,
            err: phoneOrEmail +
                ', already exists, try using another'
        };
        return res.status(200).send(response);
    }
    let count;
    let permissions;
    if (from === 'company') {
        count = await companyMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        const permProp = {
            create: true,
            read: true,
            update: true,
            delete: true
        };
        permissions = {
            orders: permProp,
            payments: permProp,
            users: permProp,
            items: permProp,
            faqs: permProp,
            videos: permProp,
            printables: permProp,
            buyer: permProp
        };
    }
    else {
        count = await user
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        const permProp = {
            create: false,
            read: false,
            update: false,
            delete: false
        };
        permissions = {
            orders: permProp,
            payments: permProp,
            users: permProp,
            items: permProp,
            faqs: permProp,
            videos: permProp,
            printables: permProp,
            buyer: {
                create: true,
                read: true,
                update: true,
                delete: true
            }
        };
    }
    const urId = makeUrId(Number(count[0]?.urId || '0'));
    let newUser;
    const expireAt = Date.now();
    if (from === 'company') {
        const { name, lastName } = req.body.user;
        newUser = new companyMain({
            urId,
            name,
            phone,
            email,
            password: passwd,
            expireAt,
            countryCode: +256
        });
    }
    else {
        const { emailPhone, firstName, lastName } = req.body.user;
        newUser = new user({
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
    }
    let response;
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
    let result;
    const type = 'token'; // note now is only token but build a counter later to make sur that the token and link methods are shared
    if (isPhone) {
        result = await sendTokenPhone(saved);
    }
    else {
        result = await sendTokenEmail(req.app, saved, type, stockAuthConfig.localSettings.appOfficialName);
    }
    if (!response.success) {
        saved.remove();
        return res.status(200).send(response);
    }
    if (Boolean(result.success)) {
        return next();
    }
    const toSend = {
        success: false,
        err: 'we could not process your request, something went wrong, but we are working on it'
    };
    return res.status(500).send(toSend);
};
superAdminRoutes.post('/login', (req, res, next) => {
    const secret = process.env['accessKey'];
    const password = req.body.password;
    if (password === secret) {
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
        const userInfo = setUserInfo('superAdmin', permissions, 'superAdmin', {
            active: false
        });
        const comapany = {
            name: 'Super Admin',
            displayName: 'Super Admin',
            dateOfEst: new Date().toString(),
            details: 'Super Cow Admin Powers',
            companyDispNameFormat: 'Super Admin',
            businessType: 'Super Admin',
            profilePic: null,
            profileCoverPic: null,
            websiteAddress: 'superadmin.eagleinfosolutions.com',
            pesapalCallbackUrl: 'Super Admin',
            pesapalCancellationUrl: 'Super Admin',
            photos: [],
            blockedReasons: null,
            left: false,
            dateLeft: null
        };
        const token = generateToken(userInfo, '1d', stockAuthConfig.authSecrets.jwtSecret);
        const nowResponse = {
            success: true,
            user: comapany,
            token
        };
        return res.status(200).send(nowResponse);
    }
    else {
        return res.status(401).send({ err: 'unauthourized ' });
    }
});
//# sourceMappingURL=superadmin.routes.js.map