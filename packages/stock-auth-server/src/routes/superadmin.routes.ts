/**
 * This file contains the authentication routes for the stock-auth-server package.
 * It exports the superAdminRoutes router and userLoginRelegator function.
 * It also imports various controllers and models from the same package and other packages.
 * @packageDocumentation
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Iauthresponse, Iauthtoken, Icustomrequest } from '@open-stock/stock-universal';
import { stockUniversalConfig } from '@open-stock/stock-universal-server';
import express from 'express';
import { generateToken, setUserInfo } from '../utils/universial';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
// const passport = require('passport');

/**
 * Router for super admin routes.
 */
export const superAdminRoutes = express.Router();


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
    const token = generateToken(userInfo, '1d', stockUniversalConfig.authSecrets.jwtSecret);
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

/**
 * Middleware function to check if the current user is a super admin.
 * If the user is not a super admin, it returns a 401 Unauthorized response.
 * Otherwise, it calls the next middleware function.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function to be called.
 * @returns {void}
 */
export const requireSuperAdmin = (req, res, next) => {
  const { userId } = (req as Icustomrequest).user;

  if (userId !== 'superAdmin') {
    return res.status(401).send({ success: false, err: 'unauthourized' });
  }

  return next();
};
