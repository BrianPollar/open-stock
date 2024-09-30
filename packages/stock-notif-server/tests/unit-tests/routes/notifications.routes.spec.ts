/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { notifnRoutes } from '../../../../stock-notif-server/src/routes/notification.routes';
// import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { IpermProp } from '@open-stock/stock-universal';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import * as http from 'http';
import { createExpressServer } from '../../../../tests/helpers';
import { createNotificationsDatabase } from '../../../src/stock-notif-local';

const mocks = vi.hoisted(() => {
  return {
    createNotifications: vi.fn()
  };
});

vi.mock('../../../../stock-notif-server/src/controllers/notifications.controller', async() => {
  const actual: object = await vi.importActual('../../../../stock-notif-server/src/controllers/notifications.controller');

  return {
    ... actual,
    createNotifications: mocks.createNotifications
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
        userId: '507f1f77bcf86cd799439011',
        companyId: 'superAdmin',
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

const mocksUnivServ = vi.hoisted(() => {
  return {
    verifyObjectId: vi.fn(),
    verifyObjectIds: vi.fn()
  };
});

vi.mock('@open-stock/stock-universal-server', async() => {
  const actual: object = await vi.importActual('@open-stock/stock-universal-server');

  return {
    ...actual,
    requireAuth: stockUniversalServer.requireAuth,
    verifyObjectId: mocksUnivServ.verifyObjectId,
    verifyObjectIds: mocksUnivServ.verifyObjectId
  };
});

const mocksModel = vi.hoisted(() => {
  return {
    mainnotificationLean: vi.fn(),
    mainnotificationMain: vi.fn()
  };
});

vi.mock('../../../../stock-notif-server/src/models/notification.model', async() => {
  const actual: object = await vi.importActual('../../../../stock-notif-server/src/models/notification.model');

  return {
    ...actual,
    mainnotificationLean: mocksModel.mainnotificationLean,
    mainnotificationMain: mocksModel.mainnotificationMain
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
  const companyId = '507f1f77bcf86cd799439011';

  beforeAll(async() => {
    app = createExpressServer();
    await createNotificationsDatabase(dbUrl);
    app.use(baseUrl, notifnRoutes);
    server = app.listen(3200, () => {
      console.log('Server has started!');
    });
  });

  beforeEach(() => {
    mocksUnivServ.verifyObjectId.mockReturnValue(true);
    mocksUnivServ.verifyObjectIds.mockReturnValue(true);
  });

  afterAll(async() => {
    // vi.unmock('@open-stock/stock-universal-server');
    await disconnectMongoose();
    server.close();
  });

  it('should get all current user notifications', async() => {
    const res = await request(app).get(apiUrl + '/getmynotifn/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body.length).toEqual(0);
  });

  it('should get all current user unread notifications', async() => {
    const res = await request(app).get(apiUrl + '/getmyavailnotifn/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body.length).toEqual(0);
  });

  it('should fail to get one as Object id is inValid', async() => {
    mocksUnivServ.verifyObjectId.mockReturnValue(false);
    mocksUnivServ.verifyObjectIds.mockReturnValue(false);
    const res = await request(app).get(apiUrl + '/one/1436347347347478348388835835/' + companyId)
      .send();

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should fail to delete on with invalid ObjectId', async() => {
    mocksUnivServ.verifyObjectId.mockReturnValue(false);
    mocksUnivServ.verifyObjectIds.mockReturnValue(false);
    const res = await request(app).delete(apiUrl + '/delete/one/1/' + companyId)
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

  it('should request append sunscription', async() => {
    mocksUnivServ.verifyObjectId.mockReturnValue(false);
    const body = {
      userId: '507f1f77bcf86cd799439011'
    }; // TODO
    const res = await request(app).post(apiUrl + '/subscription/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
  });

  it('should update if notification is viewed', async() => {
    mocksUnivServ.verifyObjectId.mockReturnValue(false);
    const body = {

    }; // TODO
    const res = await request(app).post(apiUrl + '/updateviewed/' + companyId)
      .set('Authorization', token)
      .send(body);

    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
    expect(res.body).toStrictEqual({ success: false, status: 401, err: 'unauthourised' });
  });

  it('should get the number of unviewed notifications', async() => {
    const res = await request(app).get(apiUrl + '/unviewedlength/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    // expect(res.body.success).toBe(true);
  });

  it('should clear all notifications', async() => {
    const res = await request(app).put(apiUrl + '/clearall/' + companyId)
      .set('Authorization', token)
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
  });

  it('should update notification settings', async() => {
    mocksUnivServ.verifyObjectId.mockReturnValue(false);
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
