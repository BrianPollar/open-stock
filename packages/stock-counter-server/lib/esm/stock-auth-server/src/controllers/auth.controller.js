import { makeUrId, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
import { getLogger } from 'log4js';
import { loginAtempts } from '../models/loginattemps.model';
import { companySubscriptionLean } from '../models/subscriptions/company-subscription.model';
import { user } from '../models/user.model';
import { userip } from '../models/userip.model';
import { stockAuthConfig } from '../stock-auth-local';
import { sendTokenEmail, sendTokenPhone, validateEmail, validatePhone } from './universial.controller';
const authControllerLogger = getLogger('loginAttemptController');
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
            console.log('ATTEMPY ', attemptSuccess);
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
export const checkIpAndAttempt = async (req, res, next) => {
    // let isPhone: boolean;
    console.log('FROOOOOOOOOM ', req.body.from);
    const { foundUser, passwd, isPhone } = req.body;
    console.log('found user ', foundUser);
    console.log('password is ', passwd);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userOrCompanayId = foundUser._id;
    let foundIpModel = await userip.findOne({ userOrCompanayId }).select({
        greenIps: 1,
        redIps: 1,
        unverifiedIps: 1
    });
    if (!foundIpModel) {
        foundIpModel = new userip({
            userOrCompanayId,
            greenIps: [ip]
        });
        await foundIpModel.save();
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
            const response = {
                success: false,
                err: 'Account does not exist!'
            };
            return res.status(401).send(response);
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
    console.log('before');
    // compare password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { attemptSuccess, nowRes } = await comparePassword(foundUser, passwd, isPhone);
    console.log('after');
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
    const newAttemp = new loginAtempts(attempt);
    const lastAttempt = await newAttemp.save();
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
    await foundIpModel.save();
    return next();
};
/**
 * Checks if the provided password is a common phrase.
 * If the password is found in the common phrase data, it sends a response indicating that the password is too easy.
 * Otherwise, it calls the next middleware function.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const isTooCommonPhrase = (req, res, next) => {
    const passwd = req.body.passwd;
    const { commonPhraseData } = req.localEnv;
    if (commonPhraseData.includes(passwd)) {
        const toSend = {
            success: false,
            msg: 'the password selected is to easy'
        };
        return res.status(403).send(toSend);
    }
    return next();
};
/**
 * Checks if the provided password is found in a common dictionary online.
 * If the password is found, it sends a response indicating that the password should be changed.
 * Otherwise, it proceeds to the next middleware.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const isInAdictionaryOnline = (req, res, next) => {
    const passwd = req.params.passwd;
    const { commonDictData } = req.localEnv;
    if (commonDictData.includes(passwd)) {
        const toSend = {
            success: false,
            msg: 'the password you entered was found somwhere online, please use another one'
        };
        return res.status(403).send(toSend);
    }
    return next();
};
/**
 * Determines if the provided string is a phone number or an email address and creates a filter object accordingly.
 * @param emailPhone - The string to be checked.
 * @returns An object containing the query and a flag indicating if the string is a phone number.
 */
export const determineIfIsPhoneAndMakeFilterObj = (emailPhone) => {
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
/**
 * Handles the login and registration process for users.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A Promise that resolves to void.
 */
export const loginFactorRelgator = async (req, res, next) => {
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
        companyAdminAccess: false
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
    let response;
    const saved = await newUser.save().catch(err => {
        authControllerLogger.error(`mongosse registration 
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
        return err;
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
        result = await sendTokenEmail(saved, type, stockAuthConfig.localSettings.appOfficialName);
    }
    if (!response.success) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        await user.deleteOne({ _id: saved._id });
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
/**
 * Resets the account password based on the provided verification code and new password.
 * @param req - The request object containing the request body.
 * @param res - The response object used to send the response.
 * @returns The response object with the updated account password.
 */
export const resetAccountFactory = async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { foundUser, _id, verifycode, how, password } = req.body;
    authControllerLogger.debug(`resetpassword, 
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
    let response;
    if (how === 'phone') {
        response = await validatePhone(foundUser, 'password', verifycode, password);
    }
    else {
        const type = '_code';
        response = await validateEmail(foundUser, type, 'password', verifycode, password);
    }
    return res.status(response.status).send(response.response);
};
/**
 * Recovers the user account by sending a token via email or phone.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response containing the success status and error message (if applicable).
 */
export const recoverAccountFactory = async (req, res) => {
    const { appOfficialName } = stockAuthConfig.localSettings;
    const { foundUser, emailPhone } = req.body;
    const emailOrPhone = emailPhone === 'phone' ? 'phone' : 'email';
    authControllerLogger.debug(`recover, 
    emailphone: ${emailPhone}, emailOrPhone: ${emailOrPhone}`);
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
        response = await sendTokenEmail(foundUser, type, appOfficialName);
    }
    return res.status(200).send(response);
};
/**
 * Handles the confirmation of a user account.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with the status and response data.
 */
export const confirmAccountFactory = async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { foundUser, _id, verifycode, how, type } = req.body;
    authControllerLogger.debug(`verify, verifycode: ${verifycode}, how: ${how}`);
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
    let response;
    if (how === 'phone') {
        response = await validatePhone(foundUser, 'signup', verifycode, null);
    }
    else {
        response = await validateEmail(foundUser, type, 'signup', verifycode, null);
    }
    const now = new Date();
    let filter;
    if (foundUser.companyId) {
        filter = { companyId: foundUser.companyId };
    }
    else {
        filter = { companyId: foundUser._id };
    }
    const subsctn = await companySubscriptionLean.findOne(filter)
        .lean()
        .gte('endDate', now)
        .sort({ endDate: 1 });
    if (subsctn) {
        response.response.activeSubscription = subsctn;
    }
    return res.status(response.status).send(response.response);
};
//# sourceMappingURL=auth.controller.js.map