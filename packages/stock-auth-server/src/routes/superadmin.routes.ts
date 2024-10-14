
import { Iauthresponse, Iauthtoken, IcustomRequest } from '@open-stock/stock-universal';
import { mainLogger, stockUniversalConfig } from '@open-stock/stock-universal-server';
import express, { NextFunction, Response } from 'express';
import { generateToken, setUserInfo } from '../utils/universial';

/**
 * Router for super admin routes.
 */
export const superAdminRoutes = express.Router();


superAdminRoutes.post('/login', (req: IcustomRequest<never, { password: string}>, res) => {
  mainLogger.info('Login super admin');
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
    } as unknown;
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

export const requireSuperAdmin = (req: IcustomRequest<never, unknown>, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).send({ success: false, err: 'unauthourized' });
  }
  const { userId } = req.user;

  if (userId !== 'superAdmin') {
    return res.status(401).send({ success: false, err: 'unauthourized' });
  }

  return next();
};
