import { IlAuth, IlocalPath, InotifConfig, ItwilioAuthyConfig } from '../../../stock-notif-server/src/stock-notif-server';
import express, { Application } from 'express';
import { runStockNotificationServer, IstocknotifServerConfig } from '../../../stock-notif-server/src/stock-notif-server';
import { vi, beforeAll, describe, it, expect } from 'vitest';
import { apiRouter } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../tests/helpers';
// import { databaseConfigUrl } from '../src/stock-notif-server';

const mocks = vi.hoisted(() => {
  return {
    runAuthy: vi.fn(),
    runTwilio: vi.fn(),
    makeAuthyTwilio: vi.fn(() => ({
      authy: vi.fn(),
      twilioClient: vi.fn()
    }))
  };
});

vi.mock('../../../stock-notif-server/src/controllers/twilio.controller', () => {
  return {
    runAuthy: mocks.runAuthy,
    runTwilio: mocks.runTwilio,
    makeAuthyTwilio: mocks.makeAuthyTwilio
  };
});

const appName = 'testApp';

const localPath: IlocalPath = {
  absolutepath: `${'process.cwd()'}/${appName}`,
  photoDirectory: `${'process.cwd()'}/${appName}/openphotos/`,
  videoDirectory: `${'process.cwd()'}/${appName}/openvideos/`
};

const authSecrets: IlAuth = {
  jwtSecret: 'aegwegshhweh',
  cookieSecret: 'ehwerhrewhewrhrhrh'
};

const notifStn: InotifConfig = {
  publicKey: 'notifConfig.notifPublicKey', // TODO
  privateKey: 'notifConfig.notifPrivateKey', // TODO
  redirectUrl: 'notifConfig.notifCallbacUrl' // TODO
};

const twilioAuthyConfig: ItwilioAuthyConfig = {
  secret: 'config.secret as string', // TODO
  accountSid: 'config.accountSid as string', // TODO
  authToken: 'config.authToken as string', // TODO
  twilioNumber: 'config.twilioNumber as string', // TODO
  authyKey: 'config.authyKey as string', // TODO
  enableValidationSMS: 'config.enableValidationSMS as string', // TODO
  sendGridApiKey: 'config.sendGridApiKey as string' // TODO
};

const config: IstocknotifServerConfig = {
  authSecrets,
  notificationsSettings: notifStn,
  twilioAuthySetings: twilioAuthyConfig,
  databaseConfigUrl: 'mongodb://localhost:27017/node_testyyyyy',
  localPath
};

describe('status integration tests', () => {
  let app: Application;

  beforeAll(async() => {
    app = createExpressServer();
    const notifnRoutes = await runStockNotificationServer(config, app);
    apiRouter.use('notif', notifnRoutes);
    app.use('/api', apiRouter);


    it('#notifnRoutes should be an instance of express Router', () => {
      expect(notifnRoutes).toBeInstanceOf(express.Router);
    });

    it('#apiRouter should be an instance of express Router', () => {
      expect(apiRouter).toBeInstanceOf(express.Router);
    });
  });

  it('should have globals defined', () => {
    // expect(databaseConfigUrl).toBeDefined();
  });

  it('should have express locals defined', () => {
    const keys = [
      'absolutepath',
      'photoDirectory',
      'videoDirectory'
    ];

    keys.map(key => {
      expect(app.locals[key]).toBeDefined();
    });
  });
});

