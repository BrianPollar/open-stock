/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { IpermProp } from '@open-stock/stock-universal';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import * as http from 'http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { customerRoutes } from '../../../../../stock-counter-server/src/routes/user-related/customer.routes';
import { createExpressServer } from '../../../../../tests/helpers';
import { connectStockCounterDatabase } from '../../../../src/stock-counter-local';

vi.mock('../../../../src/routes/user-related/locluser.routes', () => {
  return {
    removeManyUsers: vi.fn(),
    removeOneUser: vi.fn()
  };
});

const mocks = vi.hoisted(() => {
  return {
    runAuthy: vi.fn()
  };
});

vi.mock('../../src/controllers/twilio.controller', () => {
  return {
    runAuthy: mocks.runAuthy
  };
});

const permObj: IpermProp = {
  create: true,
  read: true,
  update: true,
  delete: true
};

const stockUniversalServer = vi.hoisted(() => {
  return {
    requireAuth: vi.fn((req: IcustomRequest<never, unknown>, res, next) => {
      req.user = {
        companyId: 'superAdmin',
        userId: '507f1f77bcf86cd799439011',
        permissions: {
          orders: permObj,
          payments: permObj,
          users: permObj,
          items: permObj,
          faqs: permObj,
          videos: permObj,
          printables: permObj,
          buyer: permObj
        }
      };
      next();
    })
  };
});

vi.mock('@open-stock/stock-universal-server', async() => {
  const actual: object = await vi.importActual('@open-stock/stock-universal-server');

  return {
    ...actual,
    requireAuth: stockUniversalServer.requireAuth
  };
});

describe('customer', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  let app = Application;
  let server: http.Server;
  const apiUrl = '/customer';
  const token = 'tokenwww';
  const objectId = '507f1f77bcf86cd799439011';
  const companyId = 'companyId';

  beforeAll(async() => {
    app = createExpressServer();
    await connectStockCounterDatabase(dbUrl);
    app.use(apiUrl, customerRoutes);
    server = app.listen(5014, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('router must be of express router', () => {
    expect(customerRoutes).toBeDefined();
  });
});
