import { Iauthresponse, IauthresponseObj, Isuccess, Iuser, Iuserperm } from '@open-stock/stock-universal';
import { makeUrId, stringifyMongooseErr, verifyObjectIds } from '@open-stock/stock-universal-server';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { loginAtempts } from '../models/loginattemps.model';
import { user } from '../models/user.model';
import { userip } from '../models/userip.model';
import { stockAuthConfig } from '../stock-auth-local';
import { sendTokenEmail, sendTokenPhone, validateEmail, validatePhone } from './universial';

const authControllerLogger = tracer.colorConsole({
  format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
  dateformat: 'HH:MM:ss.L',
  transport(data) {
    // eslint-disable-next-line no-console
    console.log(data.output);
    const logDir = path.join(process.cwd() + '/openstockLog/');

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
 * Compares the provided password with the password in the foundUser object.
 * @param foundUser - The user object found in the database.
 * @param passwd - The password to compare with the one in the foundUser object.
 * @param isPhone - A flag indicating whether the user is logging in with a phone number or an email address.
 * @returns A promise that resolves to an object containing two properties: attemptSuccess and nowRes.
 *   - attemptSuccess: A boolean indicating whether the password comparison was successful.
 *   - nowRes: A string indicating the error message to be returned to the user.
 */
const comparePassword = (foundUser, passwd: string, isPhone: boolean): Promise<{ attemptSuccess: boolean; nowRes}> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    foundUser['comparePassword'](passwd, function(err, isMatch) {
      let attemptSuccess = false;
      let nowRes = 'wrong account or password';

      if (err) {
        authControllerLogger.error('user has wrong password', err);
        attemptSuccess = false;
        if (isPhone) {
          nowRes = `phone number and
            password did not match`;
        } else {
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
export const checkIpAndAttempt = async(req, res, next) => {
  // let isPhone: boolean;
  const { foundUser, passwd, isPhone } = req.body;

  if (!foundUser?.password || !foundUser?.verified) {
    return next();
  }
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
    let savedErr: string;

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
    }; */
    // return res.status(401).send(response);
  } else if (foundIpModel) {
    const containsRedIp = foundIpModel.redIps.includes(ip);
    const containsGreenIp = foundIpModel.greenIps.includes(ip);

    if (containsRedIp) {
      const response: Iauthresponse = {
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
      return res.status(401).send(response); */
    }
  }

  if (foundIpModel?.blocked?.status) {
    const response: Iauthresponse = {
      success: false,
      err: `This Acccount has been blocked
        due to suspicious activities please contact,
        support`
    };

    return res.status(401).send(response);
  }

  if (foundIpModel?.blocked?.timesBlocked > 4) {
    const response: Iauthresponse = {
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
  } */


  const attempt = {
    userId: foundUser._id,
    ip,
    successful: attemptSuccess
  };

  const newAttemp = new loginAtempts(attempt);
  let savedErr: string;
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
    const response: Iauthresponse = {
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

/**
 * Determines if the provided string is a phone number or an email address and creates a filter object accordingly.
 * @param emailPhone - The string to be checked.
 * @returns An object containing the query and a flag indicating if the string is a phone number.
 */
export const determineIfIsPhoneAndMakeFilterObj = (emailPhone: string) => {
  if (isNaN(emailPhone as unknown as number)) {
    return {
      query: { email: emailPhone },
      isPhone: false
    };
  } else {
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
export const loginFactorRelgator = async(req, res, next) => {
  const { emailPhone, firstName, lastName } = req.body.user;
  const passwd = req.body.passwd;
  let phone;
  let email;
  let query;
  let isPhone: boolean;

  authControllerLogger.debug(`signup, 
    emailPhone: ${emailPhone}`);

  if (isNaN(emailPhone)) {
    query = {
      email: emailPhone
    };
    isPhone = false;
    email = emailPhone;
  } else {
    query = {
      phone: emailPhone
    };
    isPhone = true;
    phone = emailPhone;
  }
  const foundUser = await user.findOne(query);

  if (foundUser) {
    const phoneOrEmail = isPhone ? 'phone' : 'email';
    const response: Iauthresponse = {
      success: false,
      err: phoneOrEmail +
        ', already exists, try using another'
    };

    return res.status(200).send(response);
  }

  const count = await user
    .find({ }).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
  const urId = makeUrId(Number(count[0]?.urId || '0'));

  const permissions: Iuserperm = {
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

  let response: Isuccess;

  const saved = await newUser.save().catch(err => {
    authControllerLogger.error(`mongosse registration 
    validation error, ${err}`);
    response = {
      status: 403,
      success: false
    };
    if (err && err.errors) {
      response.err = stringifyMongooseErr(err.errors);
    } else {
      response.err = `we are having problems connecting to our databases, 
      try again in a while`;
    }

    return err;
  });

  if (!response.success) {
    return res.status(response.status).send(response);
  }

  let result: Iauthresponse;
  const type = 'token'; // note now is only token but build a counter later to make sur that the token and link methods are shared

  if (isPhone) {
    result = await sendTokenPhone(saved);
  } else {
    result = await sendTokenEmail(saved as unknown as Iuser, type, stockAuthConfig.localSettings.appOfficialName);
  }

  if (!response.success) {
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
export const resetAccountFactory = async(req, res) => {
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
  let response: IauthresponseObj;

  if (how === 'phone') {
    response = await validatePhone(foundUser, verifycode, password);
  } else {
    const type = '_code';

    response = await validateEmail(
      foundUser,
      type,
      verifycode,
      password
    );
  }

  return res.status(response.status).send(response.response);
};

/**
 * Recovers the user account by sending a token via email or phone.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response containing the success status and error message (if applicable).
 */
export const recoverAccountFactory = async(req, res) => {
  const { appOfficialName } = stockAuthConfig.localSettings;
  const { foundUser, emailPhone, navRoute } = req.body;

  authControllerLogger.debug(`recover, 
    emailphone: ${emailPhone}`);

  let response: Iauthresponse = { success: false };

  if (!foundUser) {
    response = {
      success: false,
      err: 'account does not exist'
    };

    return res.status(401).send(response);
  }

  const { isPhone } = determineIfIsPhoneAndMakeFilterObj(emailPhone);

  if (isPhone) {
    response = await sendTokenPhone(foundUser);
  } else {
    const type = 'token';

    response = await sendTokenEmail(foundUser, type, appOfficialName);
  }
  if (navRoute) {
    response.navRoute = navRoute;
  } else {
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

/**
 * Handles the confirmation of a user account.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with the status and response data.
 */
export const confirmAccountFactory = async(req, res) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { foundUser, _id, verifycode, nowHow, type, password } = req.body;

  authControllerLogger.debug(`verify, verifycode: ${verifycode}, how: ${nowHow}`);
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
  let response: IauthresponseObj;

  if (nowHow === 'phone') {
    response = await validatePhone(foundUser, verifycode, password);
  } else {
    response = await validateEmail(
      foundUser,
      type,
      verifycode,
      password
    );
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
  } */

  return res.status(response.status).send(response.response);
};
