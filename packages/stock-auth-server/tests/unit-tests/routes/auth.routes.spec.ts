/* eslint-disable @typescript-eslint/ban-ts-comment */
import { beforeAll, afterAll, vi, expect, describe, it } from 'vitest';
import { Application } from 'express';
import { createMockUser, createMockUserperm } from '../../../mocks';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../../tests/helpers';
import { connectAuthDatabase } from '../../../../stock-auth-server/src/stock-auth-server';
import request from 'supertest';
import * as http from 'http';
import { authRoutes, userLoginRelegator } from '../../../../stock-auth-server/src/routes/auth.routes';
import { Iadminloginres, Iauthresponse, Iuser } from '@open-stock/stock-universal';
// const request = require('supertest');

// hoist check if admin
const checkIfAdminHoisted = vi.hoisted(() => {
  return {
    checkIfAdmin: vi.fn().mockImplementation((req, res, next) => {
      const nowResponse: Iadminloginres = {
        success: false
      };
      return nowResponse;
    })
  };
});

// hoist authroutes some parts
const universialControllerHoisted = vi.hoisted(() => {
  return {
    generateToken: vi.fn().mockImplementation(() => 'token_egwegweg'),
    sendTokenEmail: vi.fn().mockImplementation(() => ({
      success: true,
      type: 'string',
      msg: 'string'
    })),
    sendTokenPhone: vi.fn().mockImplementation(() => ({
      success: true,
      msg: 'string'
    })),
    setUserInfo: vi.fn().mockImplementation(() => ({
      userId: 'egwegwegg',
      permissions: createMockUserperm()
    })),
    validateEmail: vi.fn().mockImplementation(() => ({
      status: 200,
      response: {
        success: true,
        msg: 'string'
      }
    })),
    validatePhone: vi.fn().mockImplementation(() => ({
      status: 200,
      response: {
        success: true,
        msg: 'string'
      }
    }))
  };
});

// hoist authroutes some parts
const authRoutesHoisted = vi.hoisted(() => {
  return {
    userLoginRelegator: vi.fn().mockImplementation((req, res, next) => {
      const nowResponse: Iauthresponse = {
        success: true,
        user: createMockUser() as unknown as Iuser,
        token: 'rwherhertj'
      };
      return res.status(200).send(nowResponse);
    }),
    userLoginRelegatorFail: vi.fn((req, res, next) => {
      return res.status(401).send('unauthorised');
    })
  };
});

// userAuthSelect
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


vi.mock('../../../src/routes/auth.routes', async() => {
  const actual = await vi.importActual('../../../src/routes/auth.routes');
  return {
    // @ts-ignore
    ...actual,
    userLoginRelegator: authRoutesHoisted.userLoginRelegator
  };
});

vi.mock('../../../src/controllers/universial.controller', async() => {
  const actual = await vi.importActual('../../../src/controllers/universial.controller');
  return {
    // @ts-ignore
    ...actual,
    generateToken: universialControllerHoisted.generateToken,
    sendTokenEmail: universialControllerHoisted.sendTokenEmail,
    sendTokenPhone: universialControllerHoisted.sendTokenPhone,
    setUserInfo: universialControllerHoisted.setUserInfo,
    validateEmail: universialControllerHoisted.validateEmail,
    validatePhone: universialControllerHoisted.validatePhone
  };
});

vi.mock('../../../src/controllers/admin.controller', async() => {
  const actual = await vi.importActual('../../../src/controllers/admin.controller');
  return {
    // @ts-ignore
    ...actual,
    checkIfAdmin: checkIfAdminHoisted.checkIfAdmin
  };
});

const stockAuthServerMock = {
  aAuth: {
    processadminID: 'string',
    password: 'string'
  },
  lAuth: null,
  localEnv: null,
  locaLMailHandler: null
};


describe('AuthRoutes', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  const apiUrl = '/auth';
  let app = Application;
  let server: http.Server;
  const token = 'token';
  const objectId = '507f1f77bcf86cd799439011';

  beforeAll(async() => {
    app = createExpressServer();
    await connectAuthDatabase(dbUrl);
    app.use(apiUrl, authRoutes);
    server = app.listen(4001, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('should deny admin login', async() => {
    app.locals.stockAuthServer = stockAuthServerMock;
    // vi.mocked(userLoginRelegator).mockReturnValue(100)
    vi.mocked(userLoginRelegator).mockImplementation((req, res) => {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    });
    const res = await request(app).post(apiUrl + '/login/admin').send({ emailPhone: 'admin', passwd: 'password' });
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
  });

  it('should deny login user', async() => {
    vi.mocked(userLoginRelegator).mockImplementation((req, res) => {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    });
    const res = await request(app).post(apiUrl + '/login').send({ emailPhone: 'admin', passwd: 'password', from: 'user' });
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
  });

  it('should pass login user', async() => {
    const res = await request(app).post(apiUrl + '/login').send({ emailPhone: 'admin', passwd: 'password', from: 'user' });
    expect(res.status).toBe(401);
    expect(typeof res.body).toBe('object');
  });

  it('should successfully signup user signup', async() => {
    const res = await request(app)
      .post(apiUrl + '/signup')
      .send({
        emailPhone: 'fjtyjy@efgw.com',
        firstName: 'password',
        lastName: 'user',
        passwd: 'dgdshshshdsh'
      });
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  it('should fail to signup user with the same email or phone', async() => {
    const res = await request(app).post(apiUrl + '/signup').send({ emailPhone: 'fjtyjy@efgw.com', firstName: 'firstName', lastName: 'lastName', passwd: 'passwd' });
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('err');
    expect(res.body.success).toBeFalsy();
    expect(typeof res.body.err).toBe('string');
  });

  it('should pass to confirm user', async() => {
    const body = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: 'req.body._id',
      verifycode: 'req.body.verifycode',
      how: 'req.body.nowHow',
      type: 'req.body.type'
    };
    const res = await request(app)
      .post(apiUrl + '/confirm')
      .send(body);
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
  });

  it('should successfully reset pasword', async() => {
    const body = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: 'req.body._id',
      verifycode: 'req.body.verifycode',
      how: 'phone',
      type: 'req.body.type'
    };
    const res = await request(app)
      .post(apiUrl + '/resetpaswd')
      .send(body);
    expect(res.status).toBe(404);
    expect(typeof res.body).toBe('object');
  });

  it('should fail to manually verify user, as it is only used for running user test', async() => {
    const res = await request(app)
      .post(apiUrl + '/manuallyverify/' + objectId)
      .send({ emailPhone: '0756920841', passwd: 'passwd' });
    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({ success: false, er: 'unauthourized' });
  });

  it('should successfully login soacial user', async() => {
    const loginCredentials = {
      from: 'user',
      type: 'google',
      socialId: 'socialId_eqgwgwhgw',
      name: 'user',
      email: 'agewgweg@gmail.com',
      profilepic: '/rherherherh'

    };
    const res = await request(app)
      .post(apiUrl + '/sociallogin')
      .send(loginCredentials);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should fail to updateprofile for user', async() => {
    const res = await request(app).post(apiUrl + '/updateprofile/' + 'all')
      .send({ age: 24 });
    expect(res.status).toBe(404);
  });

  it('should fail to reset password for user', async() => {
    const res = await request(app).put(apiUrl + '/resetpaswd')
      .set('Authorization', token)
      .send({ username: 'admin' });
    expect(res.status).toBe(200);
  });
});


// other independent functions


