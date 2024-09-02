import { apiRouter } from '@open-stock/stock-universal-server';
import { Application } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createExpressServer } from '../../../tests/helpers';
import { IstockNotifServerConfig, runStockNotificationServer } from '../../src/stock-notif-server';

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

const jwtSecret = 'aegwegshhweh';

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
    const config: IstockNotifServerConfig = {
      jwtSecret,
      databaseConfigUrl: 'mongodb://localhost:27017/node_testyyyyy',
      twilioAutyConfig: {
        authyKey: 'string',
        accountSid: 'string',
        authToken: 'string',
        defaultMail: 'string', // TODO
        twilioNumber: 'string' // TODO
      }
    };
    const { stockNotifRouter } = await runStockNotificationServer(config);

    apiRouter.use('notif', stockNotifRouter);
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

