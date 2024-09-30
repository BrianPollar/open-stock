/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { IpermProp } from '@open-stock/stock-universal';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import * as http from 'http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { itemRoutes } from '../../../../stock-counter-server/src/routes/item.routes';
import { createExpressServer } from '../../../../tests/helpers';
import { createMockItem, createMockSponsored } from '../../../../tests/stock-counter-mocks';
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
    }),
    uploadFiles: vi.fn((req: IcustomRequest<never, unknown>, res, next) => {
      next();
    }),
    appendBody: vi.fn((req: IcustomRequest<never, unknown>, res, next) => {
      next();
    }),
    deleteFiles: vi.fn((req: IcustomRequest<never, unknown>, res, next) => {
      next();
    })
  };
});

vi.mock('@open-stock/stock-universal-server', async() => {
  const actual: object = await vi.importActual('@open-stock/stock-universal-server');

  return {
    ...actual,
    requireAuth: stockUniversalServer.requireAuth,
    uploadFiles: stockUniversalServer.uploadFiles,
    appendBody: stockUniversalServer.appendBody,
    deleteFiles: stockUniversalServer.deleteFiles
  };
});

describe('ItemRoutes', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  let app = Application;
  let server: http.Server;
  const apiUrl = '/item';
  const token = 'tokenwww';
  const objectId = '507f1f77bcf86cd799439011';
  const companyId = 'companyId';

  beforeAll(async() => {
    app = createExpressServer();
    await connectStockCounterDatabase(dbUrl);
    app.use(apiUrl, itemRoutes);
    server = app.listen(5020, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('should update item', async() => {
    const body = {
      item: createMockItem()
    };
    const res = await request(app).put(apiUrl + '/update/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should update item with image', async() => {
    const body = {
      item: createMockItem()
    };
    const res = await request(app).post(apiUrl + '/update/img/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });


  it('should like item', async() => {
    const res = await request(app).put(apiUrl + '/like/1/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });


  it('should unlike item', async() => {
    const res = await request(app).put(apiUrl + '/unlike/1/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should fail to get one as Object id is inValid', async() => {
    const res = await request(app).get(apiUrl + '/one/1436347347347478348388835835/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({ });
  });

  it('should do filtergeneral', async() => {
    const res = await request(app).get(apiUrl + '/filtergeneral/prop/val/0/0/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({ });
  });

  it('should get trending items', async() => {
    const res = await request(app).get(apiUrl + '/gettrending/0/0/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should get new items', async() => {
    const res = await request(app).get(apiUrl + '/getnew/0/0/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should get brand new items', async() => {
    const res = await request(app).get(apiUrl + '/getbrandnew/0/0/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should get used items', async() => {
    const res = await request(app).get(apiUrl + '/getused/0/0/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should filter items by upper price', async() => {
    const res = await request(app).get(apiUrl + '/filterprice/max/0/0/0/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should filter items by lower price', async() => {
    const res = await request(app).get(apiUrl + '/filterprice/min/0/0/0/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should filter items by low high range', async() => {
    const res = await request(app).get(apiUrl + '/filterprice/eq/0/10/0/0/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should filter items by stars', async() => {
    const res = await request(app).get(apiUrl + '/filterstars/4/0/0/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should login admin log user', async() => {
    const res = await request(app).get(apiUrl + '/discount/100/0/0/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should get sponsored items', async() => {
    const body = {
      sponsored: []
    };
    const res = await request(app).post(apiUrl + '/getsponsored/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(403);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 403, err: 'no sponsored items provided' });
  });

  it('should add sponsored items', async() => {
    const body = {
      sponsored: createMockSponsored()
    };
    const res = await request(app).put(apiUrl + '/addsponsored/1/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
  });

  it('should update sponsored items', async() => {
    const body = {
      sponsored: createMockSponsored()
    };
    const res = await request(app).put(apiUrl + '/updatesponsored/1/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should delete sponsored item', async() => {
    const res = await request(app).delete(apiUrl + '/deletesponsored/1/spnsdId/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should fail to delete on with invalid ObjectId', async() => {
    const res = await request(app).put(apiUrl + '/delete/one/1/' + companyId)
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
  });

  it('should delete item images', async() => {
    const body = {
      filesWithDir: []
    };
    const res = await request(app).put(apiUrl + '/delete/images/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
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
