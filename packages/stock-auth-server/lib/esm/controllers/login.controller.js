import { user } from '../models/user.model';
import { loginAtempts } from '../models/loginattemps.model';
import { getLogger } from 'log4js';
const loginAttemptLogger = getLogger('loginAttemptController');
export const checkIpAndAttempt = async (req, res, next) => {
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
    const foundUser = await user.findOne(query).select({
        greenIps: 1,
        redIps: 1,
        unverifiedIps: 1
    });
    if (!foundUser) {
        const response = {
            success: false,
            err: 'Account does not exist!'
        };
        return res.status(401).send(response);
    }
    if (foundUser.blocked.status) {
        const response = {
            success: false,
            err: `This Acccount has been blocked
        due to suspicious activities please contact,
        support`
        };
        return res.status(401).send(response);
    }
    if (foundUser.blocked.timesBlocked > 4) {
        const response = {
            success: false,
            err: `This Acccount has been blocked
        due to suspicious activities please contact,
        support`
        };
        return res.status(401).send(response);
    }
    let attemptSuccess = true;
    let nowRes;
    // compare password
    foundUser['comparePassword'](passwd, function (err, isMatch) {
        if (err) {
            loginAttemptLogger.error('user has wrong password', err);
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
            return;
        }
        ;
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
    };
    const newAttemp = new loginAtempts(attempt);
    const lastAttempt = await newAttemp.save();
    const attempts = loginAtempts.find({ userId: foundUser._id });
    if (!attemptSuccess) {
        const response = {
            success: false,
            err: nowRes
        };
        return res.status(401).send(response);
    }
    foundUser.blocked = {
        status: false,
        loginAttemptRef: lastAttempt._id,
        timesBlocked: 0
    };
    return next();
};
//# sourceMappingURL=login.controller.js.map