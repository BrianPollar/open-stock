"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.signupFactorRelgator = exports.superAdminRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const log4js_1 = require("log4js");
const universial_controller_1 = require("../controllers/universial.controller");
const company_model_1 = require("../models/company.model");
const user_model_1 = require("../models/user.model");
const stock_auth_local_1 = require("../stock-auth-local");
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
// const passport = require('passport');
/**
 * Router for super admin routes.
 */
exports.superAdminRoutes = express_1.default.Router();
/**
 * Logger for authentication routes.
 */
const authLogger = (0, log4js_1.getLogger)('routes/auth');
/**
 * Handles the login and registration process for superadmin users.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A Promise that resolves to void.
 */
const signupFactorRelgator = async (req, res, next) => {
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
    const foundUser = await user_model_1.user.findOne(query);
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
        const companyCount = await company_model_1.companyMain
            // eslint-disable-next-line @typescript-eslint/naming-convention
            .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
        const companyUrId = (0, stock_universal_server_1.makeUrId)(Number(companyCount[0]?.urId || '0'));
        const { name } = req.body.company;
        permissions = {
            companyAdminAccess: true
        };
        const newCompany = new company_model_1.companyMain({
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
    const count = await user_model_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const { firstName, lastName } = req.body.user;
    const newUser = new user_model_1.user({
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
        await company.save();
    }
    let result;
    const type = 'token'; // note now is only token but build a counter later to make sur that the token and link methods are shared
    if (isPhone) {
        result = await (0, universial_controller_1.sendTokenPhone)(saved);
    }
    else {
        result = await (0, universial_controller_1.sendTokenEmail)(saved, type, stock_auth_local_1.stockAuthConfig.localSettings.appOfficialName);
    }
    if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        await user_model_1.user.deleteOne({ _id: saved._id });
        if (company) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            await company_model_1.companyMain.deleteOne({ _id: company._id });
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
exports.signupFactorRelgator = signupFactorRelgator;
exports.superAdminRoutes.post('/login', (req, res) => {
    const secret = process.env['accessKey'];
    const password = req.body.password;
    if (password === secret) {
        const permissions = {
            companyAdminAccess: true
        };
        // delete user.password; //we do not want to send back password
        const userInfo = (0, universial_controller_1.setUserInfo)('superAdmin', permissions, 'superAdmin', {
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
        const token = (0, universial_controller_1.generateToken)(userInfo, '1d', stock_auth_local_1.stockAuthConfig.authSecrets.jwtSecret);
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
const requireSuperAdmin = (req, res, next) => {
    const { userId } = req.user;
    if (userId !== 'superAdmin') {
        return res.status(401).send({ success: false, err: 'unauthourized' });
    }
    return next();
};
exports.requireSuperAdmin = requireSuperAdmin;
//# sourceMappingURL=superadmin.routes.js.map