/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { vi, afterAll, expect, describe, beforeAll, it, expectTypeOf } from 'vitest';
import { Application } from 'express';
import request from 'supertest';
import { createMockItem } from '../../../mocks';
import { createMockSponsored } from '../../../mocks';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../../tests/helpers';
import { connectStockCounterDatabase } from '../../../../stock-counter-server/src/stock-counter-server';
import * as http from 'http';
import { itemRoutes } from '../../../../stock-counter-server/src/routes/item.routes';

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
    }),
    uploadFiles: vi.fn((req, res, next) => {
      next();
    }),
    appendBody: vi.fn((req, res, next) => {
      next();
    }),
    deleteFiles: vi.fn((req, res, next) => {
      next();
    })
  };
});

vi.mock('@open-stock/stock-universal-server', async() => {
  const actual = await vi.importActual('@open-stock/stock-universal-server');
  return {
    // @ts-ignore
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

  it('should create one given the right data type', async() => {
    const body = {
      item: createMockItem()
    };
    delete body.item['_id'];
    const res = await request(app).post(apiUrl + '/create')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: true });
  });

  it('should update item', async() => {
    const body = {
      item: createMockItem()
    };
    const res = await request(app).put(apiUrl + '/update')
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
    const res = await request(app).post(apiUrl + '/updateimg')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });


  it('should like item', async() => {
    const res = await request(app).put(apiUrl + '/like/1')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });


  it('should unlike item', async() => {
    const res = await request(app).put(apiUrl + '/unlike/1')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should fail to get one as Object id is inValid', async() => {
    const res = await request(app).get(apiUrl + '/getone/1436347347347478348388835835')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({ });
  });

  it('should do filtergeneral', async() => {
    const res = await request(app).get(apiUrl + '/filtergeneral/prop/val')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf({ });
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

  it('should get trending items', async() => {
    const res = await request(app).get(apiUrl + '/gettrending')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should get new items', async() => {
    const res = await request(app).get(apiUrl + '/getnew')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should get brand new items', async() => {
    const res = await request(app).get(apiUrl + '/getbrandnew')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should get used items', async() => {
    const res = await request(app).get(apiUrl + '/getused')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should filter items by upper price', async() => {
    const res = await request(app).get(apiUrl + '/filterprice/max/0')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should filter items by lower price', async() => {
    const res = await request(app).get(apiUrl + '/filterprice/min/0')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should filter items by low high range', async() => {
    const res = await request(app).get(apiUrl + '/filterprice/eq/0/10')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should filter items by stars', async() => {
    const res = await request(app).get(apiUrl + '/filterstars/4')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should login admin log user', async() => {
    const res = await request(app).get(apiUrl + '/discount/100')
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
    const res = await request(app).post(apiUrl + '/getsponsored')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(403);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 403, err: 'no sponsored items provided' });
  });

  it('should get offered items', async() => {
    const res = await request(app).get(apiUrl + '/getoffered')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expectTypeOf(res.body).toMatchTypeOf([]);
  });

  it('should add sponsored items', async() => {
    const body = {
      sponsored: createMockSponsored()
    };
    const res = await request(app).put(apiUrl + '/addsponsored/1')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(401);
  });

  it('should update sponsored items', async() => {
    const body = {
      sponsored: createMockSponsored()
    };
    const res = await request(app).put(apiUrl + '/updatesponsored/1')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should delete sponsored item', async() => {
    const res = await request(app).delete(apiUrl + '/deletesponsored/1/spnsdId')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should fail to delete on with invalid ObjectId', async() => {
    const res = await request(app).put(apiUrl + '/deleteone/1')
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
  });

  it('should delete item images', async() => {
    const body = {
      filesWithDir: []
    };
    const res = await request(app).put(apiUrl + '/deleteimages')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should make search and return empty array', async() => {
    const body = {
      searchterm: 'rherh',
      searchKey: 'name'
    };
    const res = await request(app).post(apiUrl + '/search/0/0')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
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

