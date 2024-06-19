"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmAccountFactory = exports.recoverAccountFactory = exports.resetAccountFactory = exports.loginFactorRelgator = exports.determineIfIsPhoneAndMakeFilterObj = exports.isInAdictionaryOnline = exports.isTooCommonPhrase = exports.checkIpAndAttempt = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const loginattemps_model_1 = require("../models/loginattemps.model");
const user_model_1 = require("../models/user.model");
const userip_model_1 = require("../models/userip.model");
const stock_auth_local_1 = require("../stock-auth-local");
const universial_controller_1 = require("./universial.controller");
const authControllerLogger = tracer.colorConsole({
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
const comparePassword = (foundUser, passwd, isPhone) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        foundUser['comparePassword'](passwd, function (err, isMatch) {
            let attemptSuccess = false;
            let nowRes = 'wrong account or password';
            if (err) {
                authControllerLogger.error('user has wrong password', err);
                attemptSuccess = false;
                if (isPhone) {
                    nowRes = `phone number and
            password did not match`;
                }
                else {
                    nowRes = `email and password
            did not match`;
                }
                // throw err;
                // return;
            }
            if (isMatch) {
                attemptSuccess = true;
                nowRes = '';
            }
            resolve({ attemptSuccess, nowRes });
        });
    });
};
/**
 * Checks if the IP address is valid and attempts to log in the user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The next middleware function or an error response.
 */
const checkIpAndAttempt = async (req, res, next) => {
    // let isPhone: boolean;
    const { foundUser, passwd, isPhone } = req.body;
    if (!foundUser?.password || !foundUser?.verified) {
        return next();
    }
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userOrCompanayId = foundUser._id;
    let foundIpModel = await userip_model_1.userip.findOne({ userOrCompanayId }).select({
        greenIps: 1,
        redIps: 1,
        unverifiedIps: 1
    });
    if (!foundIpModel) {
        foundIpModel = new userip_model_1.userip({
            userOrCompanayId,
            greenIps: [ip]
        });
        let savedErr;
        await foundIpModel.save().catch(err => {
            authControllerLogger.error('save error', err);
            savedErr = err;
            return null;
        });
        if (savedErr) {
            return res.status(500).send({ success: false });
        }
        // TODO
        /* const response: Iauthresponse = {
          success: false,
          err: 'Account does not exist!'
        };*/
        // return res.status(401).send(response);
    }
    else if (foundIpModel) {
        const containsRedIp = foundIpModel.redIps.includes(ip);
        const containsGreenIp = foundIpModel.greenIps.includes(ip);
        if (containsRedIp) {
            const response = {
                success: false,
                err: 'We dont recognize the ip your are trying to login from!'
            };
            return res.status(401).send(response);
        }
        if (!containsGreenIp) {
            /* const response: Iauthresponse = {
              success: false,
              err: 'Account does not exist!'
            };
            return res.status(401).send(response);*/
        }
    }
    if (foundIpModel?.blocked?.status) {
        const response = {
            success: false,
            err: `This Acccount has been blocked
        due to suspicious activities please contact,
        support`
        };
        return res.status(401).send(response);
    }
    if (foundIpModel?.blocked?.timesBlocked > 4) {
        const response = {
            success: false,
            err: `This Acccount has been blocked
        due to suspicious activities please contact,
        support`
        };
        return res.status(401).send(response);
    }
    // compare password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { attemptSuccess, nowRes } = await comparePassword(foundUser, passwd, isPhone);
    /* if (passwd !== foundUser.password) {
      attemptSuccess = false;
      if (isPhone) {
        nowRes = `phone number and
          password did not match`;
      } else {
        nowRes = `email and password
          did not match`;
      }
    }*/
    const attempt = {
        userId: foundUser._id,
        ip,
        successful: attemptSuccess
    };
    const newAttemp = new loginattemps_model_1.loginAtempts(attempt);
    let savedErr;
    const lastAttempt = await newAttemp.save().catch(err => {
        authControllerLogger.error('save error', err);
        savedErr = err;
        return null;
    });
    if (savedErr) {
        return res.status(500).send({ success: false });
    }
    // const attempts = loginAtempts.find({ userId: foundUser._id });
    if (!attemptSuccess) {
        const response = {
            success: false,
            err: nowRes
        };
        return res.status(401).send(response);
    }
    foundIpModel.blocked = {
        status: false,
        loginAttemptRef: lastAttempt._id,
        timesBlocked: 0
    };
    await foundIpModel.save().catch(err => {
        authControllerLogger.error('save err', err);
        return;
    });
    return next();
};
exports.checkIpAndAttempt = checkIpAndAttempt;
/**
 * Checks if the provided password is a common phrase.
 * If the password is found in the common phrase data, it sends a response indicating that the password is too easy.
 * Otherwise, it calls the next middleware function.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
const isTooCommonPhrase = (req, res, next) => {
    const passwd = req.body.passwd;
    if (req.localEnv) {
        const { commonPhraseData } = req.localEnv;
        if (commonPhraseData.includes(passwd)) {
            const toSend = {
                success: false,
                msg: 'the password selected is to easy'
            };
            return res.status(403).send(toSend);
        }
    }
    return next();
};
exports.isTooCommonPhrase = isTooCommonPhrase;
/**
 * Checks if the provided password is found in a common dictionary online.
 * If the password is found, it sends a response indicating that the password should be changed.
 * Otherwise, it proceeds to the next middleware.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
const isInAdictionaryOnline = (req, res, next) => {
    const passwd = req.params.passwd;
    if (req.localEnv) {
        const { commonDictData } = req.localEnv;
        if (commonDictData.includes(passwd)) {
            const toSend = {
                success: false,
                msg: 'the password you entered was found somwhere online, please use another one'
            };
            return res.status(403).send(toSend);
        }
    }
    return next();
};
exports.isInAdictionaryOnline = isInAdictionaryOnline;
/**
 * Determines if the provided string is a phone number or an email address and creates a filter object accordingly.
 * @param emailPhone - The string to be checked.
 * @returns An object containing the query and a flag indicating if the string is a phone number.
 */
const determineIfIsPhoneAndMakeFilterObj = (emailPhone) => {
    if (isNaN(emailPhone)) {
        return {
            query: { email: emailPhone },
            isPhone: false
        };
    }
    else {
        return {
            query: { phone: emailPhone },
            isPhone: true
        };
    }
};
exports.determineIfIsPhoneAndMakeFilterObj = determineIfIsPhoneAndMakeFilterObj;
/**
 * Handles the login and registration process for users.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A Promise that resolves to void.
 */
const loginFactorRelgator = async (req, res, next) => {
    const { emailPhone, firstName, lastName } = req.body.user;
    const passwd = req.body.passwd;
    let phone;
    let email;
    let query;
    let isPhone;
    authControllerLogger.debug(`signup, 
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
    if (foundUser) {
        const phoneOrEmail = isPhone ? 'phone' : 'email';
        const response = {
            success: false,
            err: phoneOrEmail +
                ', already exists, try using another'
        };
        return res.status(200).send(response);
    }
    const count = await user_model_1.user
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = (0, stock_universal_server_1.makeUrId)(Number(count[0]?.urId || '0'));
    const permissions = {
        companyAdminAccess: false
    };
    const expireAt = Date.now();
    const newUser = new user_model_1.user({
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
    let response;
    const saved = await newUser.save().catch(err => {
        authControllerLogger.error(`mongosse registration 
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
        return res.status(200).send(response);
    }
    if (Boolean(result.success)) {
        return next();
    }
    const toSend = {
        success: false,
        err: 'we could not process your request, something went wrong, but we are working on it, ensure you are entering the right credentials'
    };
    return res.status(500).send(toSend);
};
exports.loginFactorRelgator = loginFactorRelgator;
/**
 * Resets the account password based on the provided verification code and new password.
 * @param req - The request object containing the request body.
 * @param res - The response object used to send the response.
 * @returns The response object with the updated account password.
 */
const resetAccountFactory = async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { foundUser, _id, verifycode, how, password } = req.body;
    authControllerLogger.debug(`resetpassword, 
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
    let response;
    if (how === 'phone') {
        response = await (0, universial_controller_1.validatePhone)(foundUser, verifycode, password);
    }
    else {
        const type = '_code';
        response = await (0, universial_controller_1.validateEmail)(foundUser, type, verifycode, password);
    }
    return res.status(response.status).send(response.response);
};
exports.resetAccountFactory = resetAccountFactory;
/**
 * Recovers the user account by sending a token via email or phone.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response containing the success status and error message (if applicable).
 */
const recoverAccountFactory = async (req, res) => {
    const { appOfficialName } = stock_auth_local_1.stockAuthConfig.localSettings;
    const { foundUser, emailPhone, navRoute } = req.body;
    authControllerLogger.debug(`recover, 
    emailphone: ${emailPhone}`);
    let response = { success: false };
    if (!foundUser) {
        response = {
            success: false,
            err: 'account does not exist'
        };
        return res.status(401).send(response);
    }
    const { isPhone } = (0, exports.determineIfIsPhoneAndMakeFilterObj)(emailPhone);
    if (isPhone) {
        response = await (0, universial_controller_1.sendTokenPhone)(foundUser);
    }
    else {
        const type = 'token';
        response = await (0, universial_controller_1.sendTokenEmail)(foundUser, type, appOfficialName);
    }
    if (navRoute) {
        response.navRoute = navRoute;
    }
    else {
        if (!foundUser?.verified) {
            response.navRoute = 'verify';
        }
        if (!foundUser?.password) {
            // send to reset password
            response.navRoute = 'reset';
        }
    }
    return res.status(response.status).send(response);
};
exports.recoverAccountFactory = recoverAccountFactory;
/**
 * Handles the confirmation of a user account.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with the status and response data.
 */
const confirmAccountFactory = async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { foundUser, _id, verifycode, nowHow, type, password } = req.body;
    authControllerLogger.debug(`verify, verifycode: ${verifycode}, how: ${nowHow}`);
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
    let response;
    if (nowHow === 'phone') {
        response = await (0, universial_controller_1.validatePhone)(foundUser, verifycode, password);
    }
    else {
        response = await (0, universial_controller_1.validateEmail)(foundUser, type, verifycode, password);
    }
    /* const now = new Date();
    let filter;
    if (foundUser.companyId) {
      filter = { companyId: foundUser.companyId };
    } else {
      filter = { companyId: foundUser._id };
    }
    const subsctn = await companySubscriptionLean.findOne(filter)
      .lean()
      .gte('endDate', now)
      .sort({ endDate: 1 });
    if (subsctn) {
      response.response.activeSubscription = subsctn;
    }*/
    return res.status(response.status).send(response.response);
};
exports.confirmAccountFactory = confirmAccountFactory;
//# sourceMappingURL=auth.controller.js.map