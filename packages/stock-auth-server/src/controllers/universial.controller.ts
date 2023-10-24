/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-var-requires */
// ID// 659298550876-3b56rhd1tusthh4a92v7ehteo0phiic0.apps.googleusercontent.com
// SECRET // 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
import { getLogger } from 'log4js';
// import { nodemailer } from 'nodemailer';
// const nodemailer = require('nodemailer');
import * as jwt from 'jsonwebtoken';
import { user } from '../models/user.model';
import { emailtoken } from '../models/emailtoken.model';
import { Iauthresponse, IauthresponseObj, Iauthtoken, Isuccess, Iuser, Iuserperm, makeRandomString } from '@open-stock/stock-universal';
import { stringifyMongooseErr, verifyObjectId } from '@open-stock/stock-universal-server';

/** */
const universialControllerLogger = getLogger('controllers/UniversialController');

/** generateToken : This function takes in authentication configuration, expiry date, and JWT secret as parameters and uses the  jwt.sign  method to generate a token with the specified configuration.*/
export const generateToken = (
  authConfig: Iauthtoken,
  expiryDate: string | number,
  jwtSecret: string
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
) => jwt
  .sign(authConfig, jwtSecret, {
    expiresIn: expiryDate
  });

/** setUserInfo : This function takes in a user ID and permissions as parameters and creates an authentication token object with the provided details. It also logs the details using a logger.*/
export const setUserInfo = (
  userId: string,
  permissions: Iuserperm
) => {
  const details: Iauthtoken = {
    userId,
    permissions
  };

  universialControllerLogger.info('setUserInfo - details: ', details);
  return details;
};

/** validatePhone : This function takes in a user ID, case type, verification code, and a new password as parameters. It performs various checks, such as validating the user ID and finding the user in the database. It then verifies the provided verification code using the user's Authy token. If the verification is successful, it updates the user's password (if it's a password reset case) and sends a success response. If there are any errors during the process, it returns an appropriate error response. */
export const validatePhone = async (
  userId: string,
  nowCase: string,
  verifycode: string,
  newPassword: string): Promise<IauthresponseObj> => {
    const isValid = verifyObjectId(userId);
    if (!isValid) {
      return {
        status: 401,
        response: {
          success: false,
          err: 'unauthourised'
        }
      };
    }
    const foundUser: any = await user
    .findById(userId);
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
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    const postVerify = function(err) {
      if (err) {
        universialControllerLogger.error('postVerify - err: ', err);
        let msg;
        if (nowCase === 'password') {
          msg = `The token you entered was
					invalid - please retry.`;
        } else {
          msg = `You are signed up,
					but we could not send you a
					text message. Our bad - try to login.`;
        }
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return foundUser.save(postSave);
    };

    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    const postSave = function(err) {
      if (err) {
        let response: Isuccess = {
          success: false
        };
        if (err && err.errors) {
          response.err = stringifyMongooseErr(err.errors);
        } else {
          response.err = `we are having problems connecting to our databases, 
          try again in a while`
        }
        universialControllerLogger.error('postSave err: ', err);
        resolve({
          status: 403,
          response
        });
        return;
      }
      foundUser.verified = true;
      foundUser.expireAt = '';
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
      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
      return foundUser.sendMessage(message, function(err1) {
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
    };
    return foundUser.verifyAuthyToken(verifycode,
      postVerify);
  });
};

/** validateEmail : This function is similar to  validatePhone , but it is used for email verification instead. It validates the provided verification code against the user's email token and performs similar checks and updates as  validatePhone . */
export const validateEmail = async (
  userId: string,
  type: string,
  nowCase: string,
  verifycode: string,
  newPassword: string): Promise<IauthresponseObj> => {
  universialControllerLogger.info('validateEmail - %type: , %nowCase: ', type, nowCase);
  let msg: string;
  const token = await emailtoken.findOne({ token: verifycode });
  if (!token) {
    if (type === '_link') {
      msg = `the verification
				link has already expired`;
    } else {
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

  const isValid = verifyObjectId(token.userId);
  if (!isValid) {
    return {
      status: 401,
      response: {
        success: false,
        err: 'unauthourised'
      }
    }
  }
  const foundUser = await user
    .findById(token.userId);
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
  foundUser.expireAt = '';
  foundUser.verified = true;
  if (nowCase === 'password') {
    foundUser.password = newPassword;
    msg = 'You are reset up successfully';
  } else {
    msg = 'You are signed up successfully';
  }

  let status = 200;
  let errResponse: Isuccess = {
    success: false
  };

  await foundUser.save().catch(err => {
    status = 403;
    if (err && err.errors) {
      errResponse.err = stringifyMongooseErr(err.errors);
    } else {
      errResponse.err = `we are having problems connecting to our databases, 
      try again in a while`
    }
  });

  if(status === 200) {
    return {
      status,
      response: errResponse
    }
  } else {
    return {
      status,
      response: {
        success: true,
        msg,
        user: foundUser
      }
    };
  }
};


/** sendTokenPhone : This function takes in a user object and an enableValidationSMS flag as parameters. It sends an Authy token to the user's phone number for verification. If the enableValidationSMS flag is set to '1', it uses Twilio to send the SMS. If the flag is set to any other value, it assumes SMS validation is disabled and returns a success response. */
export const sendTokenPhone = (
  foundUser,
  enableValidationSMS = '1' // twilio enable sms validation
): Promise<Iauthresponse> => new Promise(resolve => {
  universialControllerLogger.info('sendTokenPhone');
  let response: Iauthresponse;
  if (enableValidationSMS === '1') {
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    foundUser.sendAuthyToken(function(err) {
      if (err) {
        universialControllerLogger.error('sendTokenPhone - err: ', err);
        response = {
          status: 403,
          success: false,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          msg: 'Sorry our verification system is down, try again in a while'
        };
      } else {
        response = {
          status: 200,
          success: true,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _id: foundUser._id,
          phone: foundUser.phone
        };
      }
      resolve(response);
    });
  } else {
    // If we do not want to enable sms verification lets register and send confirmation
    response = {
      status: 200,
      success: true,
      msg: 'Account created (SMS validation disabled)'
    };
    resolve(response);
  }
});

/** sendTokenEmail : This function takes in the app, user object, verification type, and app official name as parameters. It generates an email verification token and sends an email to the user with the token. The email content varies based on the verification type. If the email is sent successfully, it returns a success response. If there are any errors during the process, it returns an appropriate error response. */
/**
 * Sends a verification email to the specified user with a token or link.
 * @param app - The Express app instance.
 * @param foundUser - The user object to send the email to.
 * @param type - The type of verification to send ('token' or '_link').
 * @param appOfficialName - The official name of the app sending the email.
 * @param link - Optional link to include in the email (only used if type is '_link').
 * @returns A Promise that resolves to an Iauthresponse object.
 */
export const sendTokenEmail = (
  app,
  foundUser: Iuser,
  type: string,
  appOfficialName: string,
  link?: string
  ): Promise<Iauthresponse> => new Promise(resolve => {
  universialControllerLogger.info('sendTokenEmail');
  let response: Iauthresponse = {
    success: false
  };
  let mailOptions;
  const tokenCode = makeRandomString(7, 'numbers');
  const token = new emailtoken({
    userId: foundUser._id,
    token: tokenCode
  });
  token.save().then((tok) => {
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
    } else if (type === '_link') {
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

    app.locals.stockAuthServer.locaLMailHandler.sendMail(
      mailOptions).then(res => {
      universialControllerLogger.info('message sent', res);
      response = {
        status: 200,
        success: true,
        msg: `Check ${foundUser.email} for verication code`,
        type
      };
      resolve(response);
      return;
    }).catch(error => {
      universialControllerLogger.error('email verication with token error',
        JSON.stringify(error));
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
          let errResponse: Isuccess = {
            success: false
          };
          if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
          } else {
            errResponse.err = `we are having problems connecting to our databases, 
            try again in a while`
          }
      resolve({ 
        status: 403,
        success: false, 
        err: errResponse.err });
      return;
  });
  
});
