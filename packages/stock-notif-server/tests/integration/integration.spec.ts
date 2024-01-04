import { Application } from 'express';
import { runStockNotificationServer } from '../../src/stock-notif-server';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { apiRouter } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../tests/helpers';
import { IlAuth, IlocalPath } from '@open-stock/stock-auth-server';
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

const jwtSecret = 'aegwegshhweh';
const cookieSecret = 'ehwerhrewhewrhrhrh';

const authSecrets: IlAuth = {
  jwtSecret: 'aegwegshhweh',
  cookieSecret: 'ehwerhrewhewrhrhrh'
};

const notifStn/* : InotificationConfig*/ = {
  publicKey: 'notifConfig.notifPublicKey', // TODO
  privateKey: 'notifConfig.notifPrivateKey', // TODO
  redirectUrl: 'notifConfig.notifCallbacUrl' // TODO
};

const twilioAuthyConfig2 /* : ItwilioAuthyConfig*/ = {
  secret: 'config.secret as string', // TODO
  accountSid: 'config.accountSid as string', // TODO
  authToken: 'config.authToken as string', // TODO
  twilioNumber: 'config.twilioNumber as string', // TODO
  authyKey: 'config.authyKey as string', // TODO
  enableValidationSMS: 'config.enableValidationSMS as string', // TODO
  sendGridApiKey: 'config.sendGridApiKey as string' // TODO
};

/* const config  : IstocknotifServerConfig = {
  authSecrets,
  notificationsSettings: notifStn,
  twilioAuthySetings: twilioAuthyConfig,
  databaseConfigUrl: 'mongodb://localhost:27017/node_testyyyyy',
  localPath
};*/


const twilioAuthyConfig = {
  authyKey: 'string;',
  accountSid: 'string;',
  authToken: 'string;',
  defaultMail: 'string;',
  twilioNumber: 'string;'
};

vi.mock('@open-stock/stock-universal-server', async() => {
  const actual: object = await vi.importActual('@open-stock/stock-universal-server');
  return {
    ...actual,
    isUniversalServerRunning: vi.fn().mockReturnValue(true)
  };
});

vi.mock('../../src/stock-notif-local');

describe('status integration tests', () => {
  let app: Application;
  let notifnRoutes;

  beforeEach(async() => {
    app = createExpressServer();
    const res = await runStockNotificationServer(jwtSecret, cookieSecret, twilioAuthyConfig);
    notifnRoutes = res.notifnRoutes;
    apiRouter.use('notif', notifnRoutes);
    app.use('/api', apiRouter);
  });

  it('#notifnRoutes should be an instance of express Router', () => {
    expect(notifnRoutes).toBeDefined();
    expect(notifnRoutes).toBeTypeOf('function');
  });

  it('#apiRouter should be an instance of express Router', () => {
    expect(apiRouter).toBeDefined();
    expect(apiRouter).toBeTypeOf('function');
  });
});

