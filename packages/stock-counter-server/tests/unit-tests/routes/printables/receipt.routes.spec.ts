/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { vi, afterAll, expect, describe, beforeAll, it, expectTypeOf } from 'vitest';
import { Application } from 'express';
import request from 'supertest';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../../../tests/helpers';
import * as http from 'http';
import { receiptRoutes } from '../../../../../stock-counter-server/src/routes/printables/receipt.routes';
import { connectStockCounterDatabase } from '../../../../src/stock-counter-local';
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

describe('receipt', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  let app = Application;
  let server: http.Server;
  const apiUrl = '/receipt';
  const token = 'tokenwww';
  let currentReceipt;
  const objectId = '507f1f77bcf86cd799439011';
  const companyId = 'companyId';

  beforeAll(async() => {
    app = createExpressServer();
    await connectStockCounterDatabase(dbUrl);
    app.use(apiUrl, receiptRoutes);
    server = app.listen(5013, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('should get an empty object for the provided objectId', async() => {
    const res = await request(app).get(apiUrl + '/getone/1436347347347478348388835835/' + companyId)
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  it('should fail to delete on with invalid ObjectId', async() => {
    const body = {
      id: 'currentReceipt._id'
    };
    const res = await request(app).put(apiUrl + '/deleteone/' + companyId)
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should make search and return empty array', async() => {
    const body = {
      searchterm: 'rherh',
      searchKey: 'name'
    };
    const res = await request(app).post(apiUrl + '/search/0/0/' + companyId)
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should fail to delete many on invalid ObjectId', async() => {
    const body = {
      credentials: []
    };
    const res = await request(app).put(apiUrl + '/deletemany/' + companyId)
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should pass and delete many on valid ObjectIds', async() => {
    const body = {
      credentials: [objectId]
    };
    const res = await request(app).put(apiUrl + '/deletemany/' + companyId)
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({});
    expect(res.body.success).toBe(true);
  });
});
