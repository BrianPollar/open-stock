/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { vi, expect, describe, it, afterAll, beforeAll, beforeEach, expectTypeOf } from 'vitest';
import request from 'supertest';
import { notifnRoutes } from '../../../../stock-notif-server/src/routes/notification.routes';
// import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../../tests/helpers';
import { Application } from 'express';
import { createNotificationsDatabase } from '../../../../stock-notif-server/src/stock-notif-server';
import * as http from 'http';
import { disconnectMongoose } from '@open-stock/stock-universal-server';

const mocks = vi.hoisted(() => {
  return {
    createNotifications: vi.fn()
  };
});


vi.mock('../../../../stock-notif-server/src/controllers/notifications.controller', () => {
  return {
    createNotifications: mocks.createNotifications
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

describe('AuthRoutes', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  const baseUrl = '/notifications';
  const apiUrl = '/notifications';
  // const apiUrl = 'http://127.0.0.1:3200/notifications';
  let app = Application;
  let server: http.Server;
  const token = 'token';
  const objectId = '507f1f77bcf86cd799439011';

  beforeAll(async() => {
    app = createExpressServer();
    await createNotificationsDatabase(dbUrl);
    app.use(baseUrl, notifnRoutes);
    server = app.listen(3200, () => {
      console.log('Server has started!');
    });
  });

  beforeEach(() => {

  });

  afterAll(async() => {
    // vi.unmock('@open-stock/stock-universal-server');
    await disconnectMongoose();
    server.close();
  });

  it('should create one given the right data type', async() => {
    // createNotifications = vi.fn();
    const body = {

    }; // TODO
    const res = await request(app).post(apiUrl + '/create')
      .send(body);
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: true });
  });

  it('should get all current user notifications', async() => {
    const res = await request(app).get(apiUrl + '/getmynotifn')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body.length).toEqual(0);
  });

  it('should get all current user unread notifications', async() => {
    const res = await request(app).get(apiUrl + '/getmyavailnotifn')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body.length).toEqual(0);
  });

  it('should fail to get one as Object id is inValid', async() => {
    const res = await request(app).get(apiUrl + '/getone/1436347347347478348388835835')
      .send();
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should fail to delete on with invalid ObjectId', async() => {
    const res = await request(app).delete(apiUrl + '/deleteone/1')
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

  it('should request append sunscription', async() => {
    const body = {

    }; // TODO
    const res = await request(app).post(apiUrl + '/subscription')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
  });

  it('should update if notification is viewed', async() => {
    const body = {

    }; // TODO
    const res = await request(app).post(apiUrl + '/updateviewed')
      .set('Authorization', token)
      .send(body);
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should get the number of unviewed notifications', async() => {
    const res = await request(app).get(apiUrl + '/unviewedlength')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    // expect(res.body.success).toBe(true);
  });

  it('should clear all notifications', async() => {
    const res = await request(app).put(apiUrl + '/clearall')
      .set('Authorization', token)
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
  });

  it('should create settings for notifications', async() => {
    const body = {

    }; // TODO
    const res = await request(app).post(apiUrl + '/createstn')
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
  });

  it('should update notification settings', async() => {
    const body = {

    }; // TODO

    const res = await request(app).put(apiUrl + '/updatestn')
      .send(body);
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should get notification settings', async() => {
    const res = await request(app).post(apiUrl + '/getstn').send();
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    // expect(res.body.success).toBe(true);
  });
});

