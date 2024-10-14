import { Iauthtoken, IcustomRequest, IpermProp, TroleAuth, TroleAuthProp } from '@open-stock/stock-universal';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { stockUniversalConfig } from '../stock-universal-local';
import { mainLogger } from './back-logger';
// eslint-disable-next-line @typescript-eslint/naming-convention
const GoogleStrategy = require('passport-google-oidc');
// eslint-disable-next-line @typescript-eslint/naming-convention
const FacebookStrategy = require('passport-facebook');

// This var imports the `passport` module.
const passport = require('passport');

// This var imports the `jwtStrategy` module from `passport-jwt`.
const jwtStrategy = require('passport-jwt').Strategy;

// This var imports the `extractJwt` module from `passport-jwt`.
const extractJwt = require('passport-jwt').ExtractJwt;

export interface IstrategyCred {
  google?: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    GOOGLE_CLIENT_ID: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    GOOGLE_CLIENT_SECRET: string;
  };
  facebook?: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    FACEBOOK_CLIENT_ID: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    FACEBOOK_CLIENT_SECRET: string;
  };
}

/**
 * Runs the Passport configuration for JWT authentication.
 * @param jwtSecret - The secret key used to sign and verify JWT tokens.
 */
export const runPassport = (jwtSecret, strategys?: IstrategyCred) => {
  // Create a JWT options object.
  const jwtOptions = {
    jwtFromRequest: extractJwt.fromHeader('authorization'),
    secretOrKey: jwtSecret
  };

  // Create a new JWT strategy instance.
  const jwtLogin = new jwtStrategy(jwtOptions, (jwtPayload, done) => {
    mainLogger.info('jwtLogin');
    done(null, jwtPayload);
  });


  // Use the JWT strategy with Passport.
  passport.use(jwtLogin);


  if (strategys?.google) {
    const googleLogin = new GoogleStrategy({
      clientID: strategys.google.GOOGLE_CLIENT_ID,
      clientSecret: strategys.google.GOOGLE_CLIENT_SECRET,
      callbackURL: '/oauth2/redirect/google',
      scope: [ 'profile' ]
    }, function verify(issuer, profile, cb) {
      return cb(null, profile);
    });

    passport.use(googleLogin);
  }

  if (strategys?.facebook) {
    const facebookLogin = new FacebookStrategy({
      clientID: strategys.facebook.FACEBOOK_CLIENT_ID,
      clientSecret: strategys.facebook.FACEBOOK_CLIENT_SECRET,
      callbackURL: '/oauth2/redirect/facebook',
      state: true
    }, function verify(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    });

    passport.use(facebookLogin);
  }
};

// This function defines a function that checks the user's permissions for the given role.

/**
 * Middleware function for role-based authorization.
 * @param nowRole - The current role to check.
 * @param permProp - The permission property to check within the role.
 * @returns A middleware function that checks the user's permissions
 * and authorizes access based on the role and permission property.
 */
export const roleAuthorisation = (nowRole: TroleAuth, permProp: TroleAuthProp, mayBeProfile?: boolean) => {
  // Log the role name.
  mainLogger.info(`roleAuthorisation - role: ${nowRole}`);

  // Create a middleware function that checks the user's permissions.
  return (
    // req: IcustomRequest<never, Partial<{ profileOnly?: string } &
    // unknown & Record<string, string | number | boolean | string[] | unknown>>>,
    req: IcustomRequest<never, unknown>,
    res: Response,
    next: NextFunction
  ) => {
    // Get the user's permissions from the request object.
    if (!req.user) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const { permissions } = req.user;

    if (nowRole !== 'buyer' && permissions.companyAdminAccess) {
      return next();
    }
    // If the user has the required permission, then call the next middleware function.
    if (permissions[nowRole] === true || (permissions[nowRole] && (permissions[nowRole] as IpermProp)[permProp])) {
      mainLogger.debug('roleAuthorisation - permissions', permissions);

      return next();
    } else if (mayBeProfile) {
      (req.body as { profileOnly: string }).profileOnly = 'true';

      return next();
    } else {
      // Otherwise, return a 401 Unauthorized error.
      mainLogger.error(`roleAuthorisation - unauthorised to access: ${nowRole}`);

      return res.status(401)
        .send('unauthorised');
    }
  };
};


// This function defines a function that gets the JWT token from the request object.

/**
 * Retrieves the token from the request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const getToken = (req: IcustomRequest<never, unknown>, res, next) => {
  // Return the next middleware function.
  return next();
};

/**
 * Retrieves the JWT token from the request object.
 * @param {Request} req - The request object.
 * @returns {string|null} The JWT token or null if not found.
 */
const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }

  return null;
};

/**
   * Middleware function to append the user information to the request if the token exists.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next middleware function.
   * @returns {void}
   */
export const appendUserToReqIfTokenExist = (req: IcustomRequest<never, unknown>, res, next) => {
  const token = extractToken(req);

  if (!token) {
    req.user = {} as Iauthtoken;

    return next();
  }

  jwt.verify(token, stockUniversalConfig.authSecrets.jwtSecret, function(err, decoded) {
    if (err) {
      return next();
    } else {
      req.user = decoded;

      return next();
    }
  });
};

export const canFilterDeepProps = () => {

};
