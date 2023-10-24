// This function imports the `Icustomrequest` interface from `@open-stock/stock-universal`.
import { Icustomrequest } from '@open-stock/stock-universal';

// This function imports the `getLogger()` function from `log4js`.
import { getLogger } from 'log4js';

// This function creates a passportLogger named `controllers/passport`.
const passportLogger = getLogger('controllers/passport');

// This function imports the `passport` module.
const passport = require('passport');

// This function imports the `jwtStrategy` module from `passport-jwt`.
const jwtStrategy = require('passport-jwt').Strategy;

// This function imports the `extractJwt` module from `passport-jwt`.
const extractJwt = require('passport-jwt').ExtractJwt;

// This function defines a function that sets up Passport with the given JWT secret.
/** */
export const runPassport = (jwtSecret) => {
  // Create a JWT options object.
  const jwtOptions = {
    jwtFromRequest: extractJwt.fromHeader('authorization'),
    secretOrKey: jwtSecret
  };

  // Create a new JWT strategy instance.
  const jwtLogin = new jwtStrategy(jwtOptions, (jwtPayload, done) => {
    done(null, jwtPayload);
  });

  // Use the JWT strategy with Passport.
  passport.use(jwtLogin);
};

// This function defines a function that checks the user's permissions for the given role.
/** */
export const roleAuthorisation = (nowRole) => {
  // Log the role name.
  passportLogger.info(`roleAuthorisation - role: ${nowRole}`);

  // Create a middleware function that checks the user's permissions.
  return (
    req,
    res,
    next) => {
    // Get the user's permissions from the request object.
    const { permissions } = (req as Icustomrequest).user;

    // If the user has the required permission, then call the next middleware function.
    if (permissions[nowRole] &&
        permissions[nowRole] === true) {
      passportLogger.debug('roleAuthorisation - permissions', permissions);
      return next();
    } else {
      // Otherwise, return a 401 Unauthorized error.
      passportLogger.error(`roleAuthorisation - unauthorised to access: ${nowRole}`);
      return res.status(401)
        .send('unauthorised');
    }
  };
};

// This function defines a function that gets the JWT token from the request object.
/** */
export const getToken = (req, res, next) => {
  // Return the next middleware function.
  return next();
};
