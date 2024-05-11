import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';

/** Logger for the cookie service */
const cookieServiceLogger = tracer.colorConsole(
  {
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
      fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('raw.output err ', err);
        }
      });
    }
  });

/**
 * Creates a tourer cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The next middleware function.
 */
export const makeTourerCookie = (
  req,
  res,
  next
) => {
  const tourer = req.body.tourer;
  cookieServiceLogger.info('Tourer cookie - tourer: ', tourer);
  res.cookie('tourer', tourer, {
    // maxAge: 5000,
    // expires works the same as the maxAge
    expires: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    secure: true,
    httpOnly: false,
    sameSite: 'none' // lax
  });
  return next();
};

/**
 * Creates a settings cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and the stnCookie.
 */
export const makeSettingsCookie = (
  req,
  res) => {
  const stnCookie = req.body.stnCookie;
  cookieServiceLogger.info('Setting cookie - stnCookie: ', stnCookie);
  if (!stnCookie.cartEnabled) {
    res.clearCookie('cart');
  }

  if (!stnCookie.recentEnabled) {
    res.clearCookie('recent');
  }
  res.cookie('settings', stnCookie, {
    // maxAge: 5000,
    // expires works the same as the maxAge
    expires: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    secure: true,
    httpOnly: false,
    sameSite: 'none',
    signed: true
  });
  return res.status(200).send(stnCookie);
};

/**
 * Creates a cart cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and a success message.
 */
export const makeCartCookie = (
  req,
  res) => {
  const cartCookie = req.body.cartCookie;
  cookieServiceLogger.info('Cart cookie - cartCookie: ', cartCookie);
  res.cookie('cart', cartCookie, {
    // maxAge: 5000,
    // expires works the same as the maxAge
    expires: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    secure: true,
    httpOnly: false,
    sameSite: 'none',
    signed: true
  });
  return res.status(200).send({ success: true });
};

/**
 * Creates a recent cookie.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The response object with a status of 200 and a success message.
 */
export const makeRecentCookie = (
  req,
  res
) => {
  const recentCookie = req.body.recentCookie;
  cookieServiceLogger.info('Recent Cookie - recentCookie: ', recentCookie);
  res.cookie('recent', recentCookie, {
    // maxAge: 5000,
    // expires works the same as the maxAge
    expires: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    secure: true,
    httpOnly: false,
    sameSite: 'none',
    signed: true
  });
  return res.status(200).send({ success: true });
};
