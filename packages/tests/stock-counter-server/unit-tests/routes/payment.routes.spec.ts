/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { vi, afterAll, expect, describe, beforeAll, it, expectTypeOf } from 'vitest';
import { Application } from 'express';
import request from 'supertest';
import { createMockPayment, createMockPaymentRelated } from '../../../mocks';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../../tests/helpers';
import { connectStockCounterDatabase } from '../../../../stock-counter-server/src/stock-counter-server';
import * as http from 'http';
import { paymentRoutes } from '../../../../stock-counter-server/src/routes/payment.routes';

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

const stockUniversalServer = vi.hoisted(() => {
  return {
    requireAuth: vi.fn((req, res, next) => {
      req.user = {
        userId: '507f1f77bcf86cd799439011',
        permissions: {
          orders: true,
          payments: true,
          users: true,
          items: true,
          faqs: true,
          videos: true,
          printables: true,
          buyer: true
        }
      };
      next();
    })
  };
});

vi.mock('@open-stock/stock-universal-server', async() => {
  const actual = await vi.importActual('@open-stock/stock-universal-server');
  return {
    // @ts-ignore
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

  /* it('should create one given the right data type', async() => {
    const body = {
      payment: createMockPayment(),
      paymentRelated: createMockPaymentRelated(),
      invoiceRelated: createMockInvoiceRelated()
    };
    delete body.payment['_id'];
    delete body.paymentRelated['_id'];
    delete body.invoiceRelated['_id'];
    const res = await request(app).post(apiUrl + '/create')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: true });
  });*/

  it('should update payment', async() => {
    const body = {
      updatedPayment: createMockPayment(),
      paymentRelated: createMockPaymentRelated()
    };
    const res = await request(app).put(apiUrl + '/update')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
  });

  it('should fail to get one as Object id is inValid', async() => {
    const res = await request(app).get(apiUrl + '/getone/1436347347347478348388835835')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  /* it('should get empty array for many as there is db model is empty', async() => {
    const res = await request(app).get(apiUrl + '/getall/0/0')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
    expect(res.body).toStrictEqual([]);
  });*/

  it('should get my payments', async() => {
    const res = await request(app).get(apiUrl + '/getmypayments')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
  });

  it('should fail to delete on with invalid ObjectId', async() => {
    const body = {
      id: 'currentPayment._id'
    };
    const res = await request(app).put(apiUrl + '/deleteone')
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
    const res = await request(app).delete(apiUrl + '/deleteone')
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
    const res = await request(app).post(apiUrl + '/search/0/0')
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
    const res = await request(app).put(apiUrl + '/deletemany')
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
    const res = await request(app).put(apiUrl + '/deletemany')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({});
    expect(res.body.success).toBe(true);
  });

  /* it('should invoke ipn', async() => {
    const res = await request(app).get(apiUrl + '/ipn')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
  });*/

  it('should get payment status', async() => {
    const res = await request(app).get(apiUrl + '/paymentstatus/orderTrackingId/paymentRelated')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(403);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, err: 'missing some info' });
  });
});

