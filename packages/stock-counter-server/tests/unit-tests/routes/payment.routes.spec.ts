/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { IpermProp } from '@open-stock/stock-universal';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import * as http from 'http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { paymentRoutes } from '../../../../stock-counter-server/src/routes/payment.routes';
import { createExpressServer } from '../../../../tests/helpers';
import { createMockPayment, createMockPaymentRelated } from '../../../../tests/stock-counter-mocks';
import { connectStockCounterDatabase } from '../../../src/stock-counter-local';

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

describe('PaymentRoutes', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  let app = Application;
  let server: http.Server;
  const apiUrl = '/payment';
  const token = 'tokenwww';
  let currentPayment;
  const objectId = '507f1f77bcf86cd799439011';
  const companyId = 'companyId';

  beforeAll(async() => {
    app = createExpressServer();
    await connectStockCounterDatabase(dbUrl);
    app.use(apiUrl, paymentRoutes);
    server = app.listen(5024, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('should update payment', async() => {
    const body = {
      updatedPayment: createMockPayment(),
      paymentRelated: createMockPaymentRelated()
    };
    const res = await request(app).put(apiUrl + '/update/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
  });

  it('should fail to get one as Object id is inValid', async() => {
    const res = await request(app).get(apiUrl + '/one/1436347347347478348388835835/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should get my payments', async() => {
    const res = await request(app).get(apiUrl + '/getmypayments/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
  });

  it('should fail to delete on with invalid ObjectId', async() => {
    const body = {
      id: 'currentPayment._id'
    };
    const res = await request(app).put(apiUrl + '/delete/one/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should pass and delete given valid ObjectId', async() => {
    const body = {
      id: objectId
    };
    const res = await request(app).delete(apiUrl + '/delete/one/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(404);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({});
  });

  it('should search payments', async() => {
    const body = {
      searchterm: 'rherh',
      searchKey: 'name'
    };
    const res = await request(app).post(apiUrl + '/filter/0/0/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should fail to delete many on invalid ObjectId', async() => {
    const body = {
      credentials: []
    };
    const res = await request(app).put(apiUrl + '/delete/many/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });
});
