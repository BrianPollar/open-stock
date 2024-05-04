import * as tracer from 'tracer';
import * as fs from 'fs';
// This vat creates a passportLogger named `controllers/passport`.
const passportLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = './openstockLog/';
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    throw err;
                }
            }
        });
        fs.appendFile('./openStockLog/universal-server.log', data.rawoutput + '\n', err => {
            if (err) {
                throw err;
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
export const runPassport = (jwtSecret) => {
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
// This function defines a function that checks the user's permissions for the given role.
/**
 * Middleware function for role-based authorization.
 * @param nowRole - The current role to check.
 * @param permProp - The permission property to check within the role.
 * @returns A middleware function that checks the user's permissions and authorizes access based on the role and permission property.
 */
export const roleAuthorisation = (nowRole, permProp) => {
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
        else {
            // Otherwise, return a 401 Unauthorized error.
            passportLogger.error(`roleAuthorisation - unauthorised to access: ${nowRole}`);
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
export const getToken = (req, res, next) => {
    // Return the next middleware function.
    return next();
};
/**
 * Represents an array of super admin roles.
 */
export const roleSuperAdmin = [
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