import { makeUrId, stringifyMongooseErr } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
import { generateToken, sendTokenEmail, sendTokenPhone, setUserInfo } from '../controllers/universial.controller';
import { companyMain } from '../models/company.model';
import { user } from '../models/user.model';
import { stockAuthConfig } from '../stock-auth-local';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
// const passport = require('passport');
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
export const signupFactorRelgator = async (req, res, next) => {
    const { emailPhone } = req.body;
    const userType = req.body.userType;
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
    if (userType === 'company') {
        const companyCount = await companyMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        const companyUrId = makeUrId(Number(companyCount[0]?.urId || '0'));
        const { name } = req.body.company;
        permissions = {
            companyAdminAccess: true
        };
        const newCompany = new companyMain({
            urId: companyUrId,
            name,
            phone,
            email,
            password: passwd,
            expireAt,
            countryCode: +256
        });
        company = await newCompany.save();
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
    const { firstName, lastName } = req.body.user;
    const newUser = new user({
        companyId: company._id || null,
        urId,
        fname: firstName,
        lname: lastName,
        phone,
        email,
        password: passwd,
        permissions,
        expireAt,
        countryCode: +256,
        userType
    });
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
    if (company) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        company.owner = saved._id;
        await company.save();
    }
    let result;
    const type = 'token'; // note now is only token but build a counter later to make sur that the token and link methods are shared
    if (isPhone) {
        result = await sendTokenPhone(saved);
    }
    else {
        result = await sendTokenEmail(saved, type, stockAuthConfig.localSettings.appOfficialName);
    }
    if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        saved.remove();
        if (company) {
            await company.remove();
        }
        return res.status(200).send(response);
    }
    if (Boolean(result.success)) {
        return res.status(200).send(response);
    }
    const toSend = {
        success: false,
        err: 'we could not process your request, something went wrong, but we are working on it'
    };
    return res.status(500).send(toSend);
};
superAdminRoutes.post('/login', (req, res) => {
    const secret = process.env['accessKey'];
    const password = req.body.password;
    if (password === secret) {
        const permissions = {
            companyAdminAccess: true
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
        const user = {
            comapany
        };
        const token = generateToken(userInfo, '1d', stockAuthConfig.authSecrets.jwtSecret);
        const nowResponse = {
            success: true,
            user,
            token
        };
        return res.status(200).send(nowResponse);
    }
    else {
        return res.status(401).send({ success: false, err: 'unauthourized' });
    }
});
export const requireSuperAdmin = (req, res, next) => {
    const { userId } = req.user;
    if (userId !== 'superAdmin') {
        return res.status(401).send({ success: false, err: 'unauthourized' });
    }
    return next();
};
//# sourceMappingURL=superadmin.routes.js.map