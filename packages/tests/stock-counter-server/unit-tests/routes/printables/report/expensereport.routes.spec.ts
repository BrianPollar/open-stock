/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { vi, afterAll, expect, describe, beforeAll, it, expectTypeOf } from 'vitest';
import { Application } from 'express';
import request from 'supertest';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../../../../tests/helpers';
import { connectStockCounterDatabase } from '../../../../../../stock-counter-server/src/stock-counter-server';
import * as http from 'http';
import { expenseReportRoutes } from '../../../../../../stock-counter-server/src/routes/printables/report/expensereport.routes';
import { createMockExpenseReport } from '../../../../../mocks';

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

describe('expensereport', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  let app = Application;
  let server: http.Server;
  const apiUrl = '/expensereport';
  const token = 'tokenwww';
  const objectId = '507f1f77bcf86cd799439011';

  beforeAll(async() => {
    app = createExpressServer();
    await connectStockCounterDatabase(dbUrl);
    // await cleanupCollection();
    app.use(apiUrl, expenseReportRoutes);
    server = app.listen(5003, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  /* afterEach(async() => {
    await cleanupCollection();
  });*/

  it('should create one given the right data type', async() => {
    const expenseReport1 = createMockExpenseReport();
    delete expenseReport1['_id'];
    delete expenseReport1['createdAt'];
    delete expenseReport1['updatedAt'];
    expenseReport1.expenses = [];

    const body1 = {
      expenseReport: Object.assign({}, expenseReport1)
    };

    console.log('body is', body1.expenseReport);

    const res = await request(app).post(apiUrl + '/create')
      .set('Authorization', token)
      .send(body1);
    console.log('BODY, body is', res.body);
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: true });
  });

  it('should get an empty object for the provided objectId', async() => {
    const res = await request(app).get(apiUrl + '/getone/1436347347347478348388835835')
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({});
  });

  /* it('should get empty array for many as there is db model is empty', async() => {
    // await cleanupCollection();
    const res = await request(app).get(apiUrl + '/getall/0/0')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
    expect(res.body).toStrictEqual([]);
  });*/

  it('should fail to delete on with invalid ObjectId', async() => {
    const res = await request(app).delete(apiUrl + '/deleteone/1')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should pass and delete given valid ObjectId', async() => {
    const res = await request(app).delete(apiUrl + '/deleteone/' + objectId)
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(404);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({});
    expect(res.body).toStrictEqual({ success: false, err: 'could not find item to remove' });
  });

  it('should search expensereport', async() => {
    const body = {
      searchterm: 'rherergh',
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
      ids: []
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
      ids: [objectId]
    };
    const res = await request(app).put(apiUrl + '/deletemany')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({});
    expect(res.body.success).toBe(true);
  });
});

