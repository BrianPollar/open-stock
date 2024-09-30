/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { faker } from '@faker-js/faker/locale/en_US';
import { IpermProp } from '@open-stock/stock-universal';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import * as http from 'http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { cookiesRoutes } from '../../../../stock-counter-server/src/routes/cookies.routes';
import { createExpressServer } from '../../../../tests/helpers';
import { connectStockCounterDatabase } from '../../../src/stock-counter-local';

const cokieServiceHoisted = vi.hoisted(() => {
  return {
    makeCartCookie: vi.fn((req: IcustomRequest<never, unknown>, res) => {
      return res.status(200).send({});
    }),
    makeRecentCookie: vi.fn((req: IcustomRequest<never, unknown>, res) => {
      return res.status(200).send({});
    }),
    makeSettingsCookie: vi.fn((req: IcustomRequest<never, unknown>, res) => {
      return res.status(200).send({});
    })
  };
});

const mocks = vi.hoisted(() => {
  return {
    runAuthy: vi.fn()
  };
});

vi.mock('../../../../stock-counter-server/src/controllers/cookies.service', () => {
  return {
    makeCartCookie: cokieServiceHoisted.makeCartCookie,
    makeRecentCookie: cokieServiceHoisted.makeRecentCookie,
    makeSettingsCookie: cokieServiceHoisted.makeSettingsCookie
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

describe('cookies', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  let app = Application;
  let server: http.Server;
  const apiUrl = '/cookies';
  const token = 'tokenwww';
  const objectId = '507f1f77bcf86cd799439011';
  const companyId = 'companyId';

  beforeAll(async() => {
    app = createExpressServer();
    await connectStockCounterDatabase(dbUrl);
    app.use(apiUrl, cookiesRoutes);
    app.request.signedCookies = {}; // TODO proper later test
    server = app.listen(5016, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('should get cookie settings', async() => {
    const res = await request(app).get(apiUrl + '/getsettings')
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  it('should update cookie settings', async() => {
    const body = {
      settings: {
        cartEnabled: true,
        recentEnabled: true
      }
    };
    const res = await request(app).put(apiUrl + '/updatesettings')
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  it('should add cart item', async() => {
    const body = {
      cartItemId: faker.string.uuid(),
      totalCostwithNoShipping: 1000
    };
    const res = await request(app).put(apiUrl + '/addcartitem')
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });


  it('should add recent item', async() => {
    const body = {
      recentItemId: faker.string.uuid()
    };
    const res = await request(app).put(apiUrl + '/addrecentitem')
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });


  it('should delete cart item', async() => {
    const res = await request(app).put(apiUrl + '/deletecartitem/1')
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  it('should clear cart', async() => {
    const res = await request(app).put(apiUrl + '/clearcart')
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  it('should append to cart', async() => {
    const res = await request(app).get(apiUrl + '/appendtocart')
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(404);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, err: 'not found' });
  });

  it('should append to recent', async() => {
    const res = await request(app).get(apiUrl + '/appendtorecent')
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(404);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, err: 'not found' });
  });
});
