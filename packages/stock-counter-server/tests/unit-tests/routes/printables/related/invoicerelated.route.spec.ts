/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { vi, afterAll, expect, describe, beforeAll, it } from 'vitest';
import { Application } from 'express';
import request from 'supertest';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../../../../tests/helpers';
import * as http from 'http';
import { invoiceRelateRoutes } from '../../../../../../stock-counter-server/src/routes/printables/related/invoicerelated.route';
import { connectStockCounterDatabase } from '../../../../../src/stock-counter-local';
import { IpermProp } from '@open-stock/stock-universal';

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
    requireAuth: vi.fn((req, res, next) => {
      req.user = {
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

describe('InvoiceRelatedRoutes', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  let app = Application;
  let server: http.Server;
  const apiUrl = '/invoicerelated';
  const token = 'tokenwww';
  const objectId = '507f1f77bcf86cd799439011';
  const companyId = 'companyId';

  beforeAll(async() => {
    app = createExpressServer();
    await connectStockCounterDatabase(dbUrl);
    app.use(apiUrl, invoiceRelateRoutes);
    server = app.listen(5002, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('should fail to get one as Object id is inValid', async() => {
    const res = await request(app).get(apiUrl + '/getone/1436347347347478348388835835/' + companyId)
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should get one as Object id valid', async() => {
    const res = await request(app).get(apiUrl + '/getone/' + objectId + '/' + companyId)
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });
});

