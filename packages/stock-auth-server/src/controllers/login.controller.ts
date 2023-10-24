import { Request, Response, NextFunction } from 'express';
import { user } from '../models/user.model';
import { Iauthresponse } from '@open-stock/stock-universal';
import { loginAtempts } from '../models/loginattemps.model';
import { getLogger } from 'log4js';

const loginAttemptLogger = getLogger('loginAttemptController');
/**
 * Checks if the IP address is valid and attempts to log in the user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The next middleware function or an error response.
 */
export const checkIpAndAttempt = async (req: Request, res: Response, next: NextFunction) => {
  let isPhone: boolean;
  const { emailPhone, passwd, from } = req.body;

  const mainQuery = { verified: true };
  let query;

  if (isNaN(emailPhone as number)) {
    query = { ...mainQuery, email: emailPhone };
    isPhone = false;
  } else {
    query = { ...mainQuery, phone: emailPhone };
    isPhone = true;
  }

  const foundUser = await user.findOne(query).select({
    greenIps: 1,
    redIps: 1,
    unverifiedIps: 1
  })

  if (!foundUser) {
    const response: Iauthresponse = {
      success: false,
      err: 'Account does not exist!'
    };
    return res.status(401).send(response);
  }

  if (foundUser.blocked.status) {
    const response: Iauthresponse = {
      success: false,
      err: `This Acccount has been blocked
        due to suspicious activities please contact,
        support`
    };
    return res.status(401).send(response);
  }

  if (foundUser.blocked.timesBlocked > 4) {
    const response: Iauthresponse = {
      success: false,
      err: `This Acccount has been blocked
        due to suspicious activities please contact,
        support`
    };
    return res.status(401).send(response);
  }

  let attemptSuccess = true;
  let nowRes: string;

  // compare password
  foundUser['comparePassword'](passwd, function(err, isMatch) {
    if (err) {
      loginAttemptLogger.error('user has wrong password', err);
      attemptSuccess = false;
      if (isPhone) {
        nowRes = `phone number and
          password did not match`;
      } else {
        nowRes = `email and password
          did not match`;
      }
      // throw err;
      return;
    };
  });

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

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const attempt = {
    userId: foundUser._id,
    ip,
    successful: attemptSuccess
  }
  
  const newAttemp = new loginAtempts(attempt)
  const lastAttempt = await newAttemp.save();

  const attempts = loginAtempts.find({ userId: foundUser._id });

  if(!attemptSuccess) {
    const response: Iauthresponse = {
      success: false,
      err: nowRes
    };
    return res.status(401).send(response);
  }

  foundUser.blocked = {
    status: false,
    loginAttemptRef: lastAttempt._id,
    timesBlocked: 0
  }

  return next();
}