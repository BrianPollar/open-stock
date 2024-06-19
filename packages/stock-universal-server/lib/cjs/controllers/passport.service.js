"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleSuperAdmin = exports.getToken = exports.roleAuthorisation = exports.runPassport = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
// This vat creates a passportLogger named `controllers/passport`.
const passportLogger = tracer.colorConsole({
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
        fs.appendFile(logDir + '/universal-server.log', data.rawoutput + '\n', err => {
            if (err) {
                // eslint-disable-next-line no-console
                console.log('raw.output err ', err);
            }
        });
    }
});
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
const runPassport = (jwtSecret) => {
    // Create a JWT options object.
    const jwtOptions = {
        jwtFromRequest: extractJwt.fromHeader('authorization'),
        secretOrKey: jwtSecret
    };
    // Create a new JWT strategy instance.
    const jwtLogin = new jwtStrategy(jwtOptions, (jwtPayload, done) => {
        passportLogger.info('jwtLogin');
        done(null, jwtPayload);
    });
    // Use the JWT strategy with Passport.
    passport.use(jwtLogin);
};
exports.runPassport = runPassport;
// This function defines a function that checks the user's permissions for the given role.
/**
 * Middleware function for role-based authorization.
 * @param nowRole - The current role to check.
 * @param permProp - The permission property to check within the role.
 * @returns A middleware function that checks the user's permissions and authorizes access based on the role and permission property.
 */
const roleAuthorisation = (nowRole, permProp, mayBeProfile) => {
    // Log the role name.
    passportLogger.info(`roleAuthorisation - role: ${nowRole}`);
    // Create a middleware function that checks the user's permissions.
    return (req, res, next) => {
        // Get the user's permissions from the request object.
        const { permissions } = req.user;
        if (nowRole !== 'buyer' && permissions.companyAdminAccess) {
            return next();
        }
        // If the user has the required permission, then call the next middleware function.
        if (permissions[nowRole] === true || permissions[nowRole] &&
            permissions[nowRole][permProp] &&
            permissions[nowRole][permProp] === true) {
            passportLogger.debug('roleAuthorisation - permissions', permissions);
            return next();
        }
        else if (mayBeProfile) {
            req.body.profileOnly = 'true';
            return next();
        }
        else {
            // Otherwise, return a 401 Unauthorized error.
            passportLogger.error(`roleAuthorisation - unauthorised to access: ${nowRole}`);
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
 * Represents an array of super admin roles.
 */
exports.roleSuperAdmin = [
    { name: '' },
    { name: '' },
    { name: '' },
    { name: '' },
    { name: '' },
    { name: '' },
    { name: '' },
    { name: '' },
    { name: '' }
];
//# sourceMappingURL=passport.service.js.map