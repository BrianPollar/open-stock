/**
 * This file contains the authentication routes for the stock-auth-server package.
 * It exports the superAdminRoutes router and userLoginRelegator function.
 * It also imports various controllers and models from the same package and other packages.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Iauthresponse, Iauthtoken, Icustomrequest } from '@open-stock/stock-universal';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { generateToken, setUserInfo } from '../controllers/universial.controller';
import { stockAuthConfig } from '../stock-auth-local';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
// const passport = require('passport');

/**
 * Router for super admin routes.
 */
export const superAdminRoutes = express.Router();

/**
 * Logger for authentication routes.
 */
const authLogger = tracer.colorConsole(
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
      fs.appendFile(logDir + '/auth-server.log', data.rawoutput + '\n', err => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('raw.output err ', err);
        }
      });
    }
  });

superAdminRoutes.post('/login', (req, res) => {
  const secret = process.env['accessKey'];
  const password = req.body.password;
  if (password === secret) {
    const permissions = {
      companyAdminAccess: true
    };
    // delete user.password; //we do not want to send back password
    const userInfo: Iauthtoken = setUserInfo(
      'superAdmin',
      permissions,
      'superAdmin',
      {
        active: false
      }
    );

    const comapany = {
      name: 'Super Admin',
      displayName: 'Super Admin',
      dateOfEst: new Date().toString(),
      details: 'Super Cow Admin Powers',
      companyDispNameFormat: 'Super Admin',
      businessType: 'Super Admin',
      profilePic: null,
      profileCoverPic: null,
      websiteAddress: 'superadmin.eagleinfosolutions.com',
      pesapalCallbackUrl: 'Super Admin',
      pesapalCancellationUrl: 'Super Admin',
      photos: [],
      blockedReasons: null,
      left: false,
      dateLeft: null
    };
    const user = {
      comapany
    } as any;
    const token = generateToken(
      userInfo, '1d', stockAuthConfig.authSecrets.jwtSecret);
    const nowResponse = {
      success: true,
      user,
      token
    } as Iauthresponse;
    return res.status(200).send(nowResponse);
  } else {
    return res.status(401).send({ success: false, err: 'unauthourized' });
  }
});

export const requireSuperAdmin = (
  req,
  res,
  next
) => {
  const { userId } = (req as Icustomrequest).user;
  if (userId !== 'superAdmin') {
    return res.status(401).send({ success: false, err: 'unauthourized' });
  }
  return next();
};
