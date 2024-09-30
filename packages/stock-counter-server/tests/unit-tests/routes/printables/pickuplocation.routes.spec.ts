/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createExpressServer } from '../../../../../tests/helpers';
// import { createMockPickupLocation } from '@open-stock/stock-counter-client';
import { IpermProp } from '@open-stock/stock-universal';
import * as http from 'http';
import { pickupLocationRoutes } from '../../../../../stock-counter-server/src/routes/printables/pickuplocation.routes';
import { connectStockCounterDatabase } from '../../../../src/stock-counter-local';

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

describe('pickuplocation', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  let app = Application;
  let server: http.Server;
  const apiUrl = '/pickuplocation';
  const token = 'tokenwww';
  const objectId = '507f1f77bcf86cd799439011';
  const companyId = 'companyId';
  // let currentPickupLocation;

  beforeAll(async() => {
    app = createExpressServer();
    await connectStockCounterDatabase(dbUrl);
    app.use(apiUrl, pickupLocationRoutes);
    server = app.listen(5012, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  /* it('should create one given the right data type', async() => {
    const body = {
      pickupLocation: {

      }
    };
    const res = await request(app).post(apiUrl + '/create/' + companyId)
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(403);
    expect(typeof res.body).toBe('object');
    expect(res.body.success).toBe(false);
  }); */

  it('should fail to get one as Object id is inValid', async() => {
    const res = await request(app).get(apiUrl + '/one/1436347347347478348388835835/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(401);
  });

  /* it('should get empty array for many as there is db model is empty', async() => {
    const res = await request(app).get(apiUrl + '/all/0/0')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
    expect(res.body).toStrictEqual([]);
  }); */

  it('should fail to delete on with invalid ObjectId', async() => {
    const res = await request(app).delete(apiUrl + '/delete/one/1/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should pass and delete given valid ObjectId', async() => {
    const res = await request(app).delete(apiUrl + '/delete/one/' + objectId + '/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(404);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({});
    expect(res.body).toStrictEqual({ success: false, err: 'could not find item to remove' });
  });

  it('should search pickuplocations', async() => {
    const body = {
      searchterm: 'rherh',
      searchKey: 'name'
    };
    const res = await request(app).post(apiUrl + '/filter/0/0/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should fail to delete many on invalid ObjectId', async() => {
    const body = {
      _ids: []
    };
    const res = await request(app).put(apiUrl + '/delete/many/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should pass and delete many on valid ObjectIds', async() => {
    const body = {
      _ids: [objectId]
    };
    const res = await request(app).put(apiUrl + '/delete/many/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({});
    expect(res.body.success).toBe(true);
  });
});
