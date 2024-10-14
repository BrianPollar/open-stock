"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canFilterDeepProps = exports.appendUserToReqIfTokenExist = exports.getToken = exports.roleAuthorisation = exports.runPassport = void 0;
const tslib_1 = require("tslib");
const jwt = tslib_1.__importStar(require("jsonwebtoken"));
const stock_universal_local_1 = require("../stock-universal-local");
const back_logger_1 = require("./back-logger");
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
/**
 * Runs the Passport configuration for JWT authentication.
 * @param jwtSecret - The secret key used to sign and verify JWT tokens.
 */
const runPassport = (jwtSecret, strategys) => {
    // Create a JWT options object.
    const jwtOptions = {
        jwtFromRequest: extractJwt.fromHeader('authorization'),
        secretOrKey: jwtSecret
    };
    // Create a new JWT strategy instance.
    const jwtLogin = new jwtStrategy(jwtOptions, (jwtPayload, done) => {
        back_logger_1.mainLogger.info('jwtLogin');
        done(null, jwtPayload);
    });
    // Use the JWT strategy with Passport.
    passport.use(jwtLogin);
    if (strategys?.google) {
        const googleLogin = new GoogleStrategy({
            clientID: strategys.google.GOOGLE_CLIENT_ID,
            clientSecret: strategys.google.GOOGLE_CLIENT_SECRET,
            callbackURL: '/oauth2/redirect/google',
            scope: ['profile']
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
exports.runPassport = runPassport;
// This function defines a function that checks the user's permissions for the given role.
/**
 * Middleware function for role-based authorization.
 * @param nowRole - The current role to check.
 * @param permProp - The permission property to check within the role.
 * @returns A middleware function that checks the user's permissions
 * and authorizes access based on the role and permission property.
 */
const roleAuthorisation = (nowRole, permProp, mayBeProfile) => {
    // Log the role name.
    back_logger_1.mainLogger.info(`roleAuthorisation - role: ${nowRole}`);
    // Create a middleware function that checks the user's permissions.
    return (
    // req: IcustomRequest<never, Partial<{ profileOnly?: string } &
    // unknown & Record<string, string | number | boolean | string[] | unknown>>>,
    req, res, next) => {
        // Get the user's permissions from the request object.
        if (!req.user) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        const { permissions } = req.user;
        if (nowRole !== 'buyer' && permissions.companyAdminAccess) {
            return next();
        }
        // If the user has the required permission, then call the next middleware function.
        if (permissions[nowRole] === true || (permissions[nowRole] && permissions[nowRole][permProp])) {
            back_logger_1.mainLogger.debug('roleAuthorisation - permissions', permissions);
            return next();
        }
        else if (mayBeProfile) {
            req.body.profileOnly = 'true';
            return next();
        }
        else {
            // Otherwise, return a 401 Unauthorized error.
            back_logger_1.mainLogger.error(`roleAuthorisation - unauthorised to access: ${nowRole}`);
            return res.status(401)
                .send('unauthorised');
        }
    };
};
exports.roleAuthorisation = roleAuthorisation;
// This function defines a function that gets the JWT token from the request object.
/**
 * Retrieves the token from the request.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
const getToken = (req, res, next) => {
    // Return the next middleware function.
    return next();
};
exports.getToken = getToken;
/**
 * Retrieves the JWT token from the request object.
 * @param {Request} req - The request object.
 * @returns {string|null} The JWT token or null if not found.
 */
const extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }
    else if (req.query && req.query.token) {
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
const appendUserToReqIfTokenExist = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        req.user = {};
        return next();
    }
    jwt.verify(token, stock_universal_local_1.stockUniversalConfig.authSecrets.jwtSecret, function (err, decoded) {
        if (err) {
            return next();
        }
        else {
            req.user = decoded;
            return next();
        }
    });
};
exports.appendUserToReqIfTokenExist = appendUserToReqIfTokenExist;
const canFilterDeepProps = () => {
};
exports.canFilterDeepProps = canFilterDeepProps;
//# sourceMappingURL=passport.js.map