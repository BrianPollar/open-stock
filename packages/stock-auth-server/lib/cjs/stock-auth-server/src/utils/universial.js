"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTokenEmail = exports.sendTokenPhone = exports.validateEmail = exports.validatePhone = exports.makeUserReturnObject = exports.setUserInfo = exports.generateToken = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-var-requires */
// ID// 659298550876-3b56rhd1tusthh4a92v7ehteo0phiic0.apps.googleusercontent.com
// SECRET // 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
const fs = tslib_1.__importStar(require("fs"));
const tracer = tslib_1.__importStar(require("tracer"));
// import { nodemailer } from 'nodemailer';
// const nodemailer = require('nodemailer');
const stock_notif_server_1 = require("@open-stock/stock-notif-server");
const stock_universal_1 = require("@open-stock/stock-universal");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const jwt = tslib_1.__importStar(require("jsonwebtoken"));
const path_1 = tslib_1.__importDefault(require("path"));
const company_model_1 = require("../models/company.model");
const emailtoken_model_1 = require("../models/emailtoken.model");
const company_subscription_model_1 = require("../models/subscriptions/company-subscription.model");
const user_model_1 = require("../models/user.model");
const universialControllerLogger = tracer.colorConsole({
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
 * Generates a JWT token with the provided authentication configuration, expiry date, and JWT secret.
 * @param authConfig - The authentication configuration.
 * @param expiryDate - The expiry date for the token.
 * @param jwtSecret - The JWT secret used for signing the token.
 * @returns The generated JWT token.
 */
const generateToken = (authConfig, expiryDate, jwtSecret
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
) => jwt
    .sign(authConfig, jwtSecret, {
    expiresIn: expiryDate
});
exports.generateToken = generateToken;
/**
 * Sets the user information.
 * @param userId - The ID of the user.
 * @param permissions - The user's permissions.
 * @param companyId - The ID of the company.
 * @param companyPermissions - The company's permissions.
 * @returns The user information.
 */
const setUserInfo = (userId, permissions, companyId, companyPermissions) => {
    const details = {
        userId,
        permissions,
        companyId,
        companyPermissions
    };
    universialControllerLogger.info('setUserInfo - details: ', details);
    return details;
};
exports.setUserInfo = setUserInfo;
/**
 * Generates an authentication response object containing the user, company, token, and active subscription information.
 * @param foundUser - The user object to generate the response for.
 * @returns A promise that resolves to an authentication response object.
 */
const makeUserReturnObject = async (foundUser) => {
    const company = await company_model_1.companyLean.findById(foundUser?.companyId)
        .populate({ path: 'owner', model: user_model_1.userLean,
        populate: [{
                path: 'photos', model: stock_universal_server_1.fileMetaLean
            }]
    })
        .lean();
    if (company && company.owner.photos[0]) {
        company.profilePic = company.owner.photos[0];
    }
    universialControllerLogger.debug('found company: ', company);
    let permissions;
    if (company && company.owner === foundUser._id.toString()) {
        permissions = {
            companyAdminAccess: true
        };
    }
    else {
        permissions = foundUser.permissions || {};
    }
    const userInfo = (0, exports.setUserInfo)(foundUser._id.toString(), permissions, foundUser.companyId, { active: !company.blocked });
    const token = (0, exports.generateToken)(userInfo, '1d', stock_universal_server_1.stockUniversalConfig.authSecrets.jwtSecret);
    let activeSubscription;
    const now = new Date();
    if (company) {
        const subsctn = await company_subscription_model_1.companySubscriptionLean
            .findOne({ companyId: company._id, status: 'paid' })
            .lean()
            .gte('endDate', now)
            .sort({ endDate: -1 });
        activeSubscription = subsctn;
    }
    universialControllerLogger.debug('found foundUser: ', foundUser);
    return {
        success: true,
        user: foundUser,
        company,
        token,
        activeSubscription
    };
};
exports.makeUserReturnObject = makeUserReturnObject;
/**
 * Validates the phone number of a user and performs necessary actions based on the case.
 * @param foundUser - The user object to validate.
 * @param nowCase - The current case, either 'password' or 'signup'.
 * @param verifycode - The verification code entered by the user.
 * @param newPassword - The new password to set (only applicable for 'password' case).
 * @returns A promise that resolves to an authentication response object.
 */
const validatePhone = async (foundUser, verifycode, newPassword) => {
    if (!foundUser) {
        return {
            status: 404,
            response: {
                success: false,
                err: 'user account not found'
            }
        };
    }
    return new Promise(resolve => {
        const postVerify = async function (err) {
            if (err) {
                universialControllerLogger.error('postVerify - err: ', err);
                resolve({
                    status: 401,
                    response: {
                        success: false,
                        msg: 'The token you entered was invalid - please retry.'
                    }
                });
                return;
            }
            foundUser.verified = true;
            foundUser.expireAt = '';
            let message;
            if (newPassword) {
                foundUser.password = newPassword;
                message = `You did it! Your
				password has been reset :`;
            }
            else {
                message = `You did it! Your
				are all setup and
				you can now you can customise your profile`;
            }
            const responseObj = await (0, exports.makeUserReturnObject)(foundUser);
            responseObj.msg = message;
            foundUser.save().then(() => {
                foundUser.save();
                resolve({
                    status: 200,
                    response: responseObj
                });
            }).catch(err => {
                universialControllerLogger.error('save error', err);
                resolve({
                    status: 500,
                    response: {
                        success: false
                    }
                });
                return;
            });
        };
        return foundUser['verifyAuthyToken'](verifycode, postVerify);
        /* const postSave = function(err) {
          if (err) {
            const response: Isuccess = {
              success: false
            };
            if (err && err.errors) {
              response.err = stringifyMongooseErr(err.errors);
            } else {
              response.err = `we are having problems connecting to our databases,
              try again in a while`;
            }
            universialControllerLogger.error('postSave err: ', err);
            resolve({
              status: 403,
              response
            });
            return;
          }
    
          let message;
          if (nowCase === 'password') {
            foundUser.password = newPassword;
            message = `You did it! Your
                    password has been reset :`;
          } else {
            message = `You did it! Your
                    are all setup and
                    you can now you can customise your profile`;
          }
          foundUser.save();
          return foundUser['sendMessage'](message, function(err1) {
            let msg;
            if (nowCase === 'password') {
              msg = `You are reset up,
                        but we could not send you a
                        text message. Our bad - try to login.`;
            } else {
              msg = `You are signed up,
                        but we could not send you a text
                        message. Our bad - try to login.`;
            }
            if (err1) {
              universialControllerLogger.debug('sendMessage - err1: ', err1);
              resolve({
                status: 200,
                response: {
                  success: true,
                  msg,
                  user: foundUser
                }
              });
              return;
            }
            // show success page
            resolve({
              status: 200,
              response: {
                success: true,
                msg: message,
                user: foundUser
              }
            });
          });
        }; */
    });
};
exports.validatePhone = validatePhone;
/**
 * Validates the email for a user.
 * @param foundUser - The user object.
 * @param type - The type of validation (e.g., '_link', 'code').
 * @param nowCase - The current case (e.g., 'password', 'signup').
 * @param verifycode - The verification code or token.
 * @param newPassword - The new password (only applicable for 'password' case).
 * @returns A promise that resolves to an authentication response object.
 */
const validateEmail = async (foundUser, type, verifycode, newPassword) => {
    universialControllerLogger.info('validateEmail - %type: ', type);
    let msg;
    if (!foundUser) {
        msg = 'try signup again, account not found';
        return {
            status: 401,
            response: {
                success: false,
                err: msg
            }
        };
    }
    const token = await emailtoken_model_1.emailtoken.findOne({ token: verifycode });
    if (!token) {
        if (type === '_link') {
            msg = `the verification
				link has already expired`;
        }
        else {
            msg = `the verification code
				has already expired`;
        }
        return {
            status: 401,
            response: {
                success: false,
                err: msg
            }
        };
    }
    const isValid = (0, stock_universal_server_1.verifyObjectId)(token.userId);
    if (!isValid) {
        return {
            status: 401,
            response: {
                success: false,
                err: 'unauthourised'
            }
        };
    }
    foundUser.expireAt = '';
    foundUser.verified = true;
    if (newPassword) {
        foundUser.password = newPassword;
    }
    msg = 'You are signed up successfully';
    let status = 200;
    const errResponse = {
        success: false
    };
    await foundUser.save().catch(err => {
        status = 403;
        if (err && err.errors) {
            errResponse.err = (0, stock_universal_server_1.stringifyMongooseErr)(err.errors);
        }
        else {
            errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`;
        }
    });
    if (status === 403) {
        return {
            status,
            response: errResponse
        };
    }
    else {
        const responseObj = await (0, exports.makeUserReturnObject)(foundUser);
        responseObj.msg = msg;
        return {
            status,
            response: responseObj
        };
    }
};
exports.validateEmail = validateEmail;
/**
 * Sends a token to the user's phone for authentication.
 * @param foundUser - The user object.
 * @param enableValidationSMS - Flag indicating whether to enable SMS validation. Default is '1'.
 * @returns A promise that resolves to an authentication response object.
 */
const sendTokenPhone = (foundUser, 
// eslint-disable-next-line @typescript-eslint/naming-convention
enableValidationSMS = '1' // twilio enable sms validation
) => new Promise(resolve => {
    universialControllerLogger.info('sendTokenPhone');
    let response;
    if (enableValidationSMS === '1') {
        foundUser.sendAuthyToken(function (err) {
            if (err) {
                universialControllerLogger.error('sendTokenPhone - err: ', err);
                response = {
                    status: 403,
                    success: false,
                    msg: 'Sorry our verification system is down, try again in a while'
                };
            }
            else {
                response = {
                    status: 200,
                    success: true,
                    _id: foundUser._id,
                    phone: foundUser.phone
                };
            }
            resolve(response);
        });
    }
    else {
        // If we do not want to enable sms verification lets register and send confirmation
        response = {
            status: 200,
            success: true,
            _id: foundUser._id,
            msg: 'Account created (SMS validation disabled)'
        };
        resolve(response);
    }
});
exports.sendTokenPhone = sendTokenPhone;
/**
 * Sends a verification email to the specified user with a token or link.
 * @param foundUser - The user object to send the email to.
 * @param type - The type of verification to send ('token' or '_link').
 * @param appOfficialName - The official name of the app sending the email.
 * @returns A Promise that resolves to an Iauthresponse object.
 */
const sendTokenEmail = (foundUser, type, appOfficialName
// link?: string
) => new Promise(resolve => {
    universialControllerLogger.info('sendTokenEmail');
    let response = {
        success: false
    };
    let mailOptions;
    const tokenCode = (0, stock_universal_1.makeRandomString)(7, 'numbers');
    const token = new emailtoken_model_1.emailtoken({
        userId: foundUser._id,
        token: tokenCode
    });
    token.save().then(() => {
        if (type === 'token') {
            mailOptions = {
                from: 'info@eagleinfosolutions.com',
                to: foundUser.email,
                subject: `${appOfficialName} Email verification`,
                text: 'Please enter the provided 7 digit code to complete ' + token.token,
                html: `<!DOCTYPE html>
        <html lang="en">
        <head>
<style>
  body {
    background: rgb(238, 238, 238);
  }
.main-div {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  font-weight: normal;
}
  h2 {
    text-align:center;
    padding-top: 40px;
  }

  .body-div{
    font-weight: lighter;
    text-align: left;
    width: 80%;
    margin: 0 auto;
    font-size: 0.8em;
  }

  .code-para{
    font-size: 1.2em;
  }

  .last-divi {
    padding-top: 30px;
    text-align: center;
    font-size: 0.7em;
  }

  .compny-divi {
    padding-bottom: 40px;
    text-align: center;
    font-size: 0.7em;
  }

  .img-divi {
    width: 75px;
    height: 75px;
    margin-left: calc(100% - 80px);
  }

  .img-divi-img {
width: 100%;
height: 100%;
    }
</style>
</head>
        <body>
        <div class="main-div">
          <div class="img-divi">
            <img class="img-divi-img" src="https://eagleinfosolutions.com/dist/public/logo2.png" />
          </div>
        <h2>Confirm your email address<h2>
          <div class="body-div">
          We need to know you exist, 
          There’s one quick step you need to  
          complete before creating your Eagle Info Solutions account. 
          Let’s make sure this is the right 
          email address for you — please confirm this is the right  
          address to use for your new account.

          <p>Please enter this verification code to get started on Eagle Info Solutions:</p>
          <p class="code-para"><b>${token.token}</b> .</p>
          <p>Verification codes expire after two hours.</p>
          
          <div>Thanks,
          Eagle Info Solutions
          </div>

          <div class="last-divi">
            <a href="https://eagleinfosolutions.com/support">Help</a> | <a href="https://eagleinfosolutions.com/support">Contacts</a>
          </div>

          <div class="compny-divi"> Eagle Info Solutions Inc, Kampala Uganda</div>
          </div>
          </div>
          </body>
</html>`
            };
        }
        else if (type === '_link') {
            const nowLink = 'http://localhost:4200/verify?id=' + token.token;
            mailOptions = {
                from: 'info@eagleinfosolutions.com',
                to: foundUser.email,
                subject: `${appOfficialName} Email verification`,
                text: 'Please confirm your email address',
                // html: 'Hello, <br> Please click on the link to veify you email.<br><a href=`${nowLink}`></a>'
                html: `<!DOCTYPE html>
        <html lang="en">
        <head>
<style>
  body {
    background: rgb(238, 238, 238);
  }
.main-div {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  font-weight: normal;
}
  h2 {
    text-align:center;
    padding-top: 40px;
  }

  .body-div{
    font-weight: lighter;
    text-align: left;
    width: 80%;
    margin: 0 auto;
    font-size: 0.8em;
  }

  .code-para{
    font-size: 1.2em;
  }

  .last-divi {
    padding-top: 30px;
    text-align: center;
    font-size: 0.7em;
  }

  .compny-divi {
    padding-bottom: 40px;
    text-align: center;
    font-size: 0.7em;
  }

  .img-divi {
    width: 75px;
    height: 75px;
    margin-left: calc(100% - 80px);
  }

  .img-divi-img {
width: 100%;
height: 100%;
    }
</style>
</head>
        <body>
        <div class="main-div">
          <div class="img-divi">
            <img class="img-divi-img" src="https://eagleinfosolutions.com/dist/public/logo2.png" />
          </div>
        <h2>Confirm your email address<h2>
          <div class="body-div">
          We need to know you exist, 
          There’s one quick step you need to  
          complete before creating your Eagle Info Solutions account. 
          Let’s make sure this is the right 
          email address for you — please confirm this is the right  
          address to use for your new account.

          <p>Please click on the provided link to get started on Eagle Info Solutions:</p>
          <p class="code-para"><b><a href=${nowLink}></b> .</p>
          <p>Verification codes expire after two hours.</p>
          
          <div>Thanks,
          Eagle Info Solutions
          </div>

          <div class="last-divi">
            <a href="https://eagleinfosolutions.com/support">Help</a> | <a href="https://eagleinfosolutions.com/support">Contacts</a>
          </div>

          <div class="compny-divi"> Eagle Info Solutions Inc, Kampala Uganda</div>
          </div>
          </div>
          </body>
</html>`
            };
        }
        (0, stock_notif_server_1.sendMail)(mailOptions).then(res => {
            universialControllerLogger.info('message sent', res);
            response = {
                status: 200,
                _id: foundUser._id,
                success: true,
                msg: `Check ${foundUser.email} for verication code`,
                type
            };
            resolve(response);
            return;
        }).catch(error => {
            universialControllerLogger.error('email verication with token error', JSON.stringify(error));
            response = {
                status: 403,
                success: false,
                msg: 'Server validation error, oops probably email verifier is offline, try again later'
            };
            resolve(response);
            return;
        });
    }).catch((err) => {
        universialControllerLogger.error(`sendTokenEmail
          token.save error, ${err}`);
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
        resolve({
            status: 403,
            success: false,
            err: errResponse.err
        });
        return;
    });
});
exports.sendTokenEmail = sendTokenEmail;
//# sourceMappingURL=universial.js.map