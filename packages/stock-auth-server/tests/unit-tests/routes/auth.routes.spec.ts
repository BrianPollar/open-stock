/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Iadminloginres, Iauthresponse, IpermProp, Iuser } from '@open-stock/stock-universal';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { Application } from 'express';
import * as http from 'http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createExpressServer } from '../../../../tests/helpers';
import { createMockUser, createMockUserperm } from '../../../../tests/stock-auth-mocks';
import { authRoutes } from '../../../src/routes/user.routes';
import { connectAuthDatabase } from '../../../src/stock-auth-local';
// const request = require('supertest');

// hoist check if admin
const checkIfAdminHoisted = vi.hoisted(() => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const authControllerHoisted = vi.hoisted(() => {
  return {
    checkIpAndAttempt: vi.fn().mockImplementation((req, res, next) => {
      return next();
    })
  };
});

// hoist authroutes some parts
const authRoutesHoisted = vi.hoisted(() => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const permObj: IpermProp = {
  create: true,
  read: true,
  update: true,
  delete: true
};

// userAuthSelect
const stockUniversalServer = vi.hoisted(() => {
  return {
    requireAuth: vi.fn((req, res, next) => {
      req.user = {
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

vi.mock('../../../src/routes/auth.routes', async() => {
  const actual: object = await vi.importActual('../../../src/routes/auth.routes');

  return {
    ...actual,
    userLoginRelegator: authRoutesHoisted.userLoginRelegator
  };
});

vi.mock('../../../src/controllers/universial.controller', async() => {
  const actual: object = await vi.importActual('../../../src/controllers/universial.controller');

  return {
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
  const actual: object = await vi.importActual('../../../src/controllers/admin.controller');

  return {
    ...actual,
    checkIfAdmin: checkIfAdminHoisted.checkIfAdmin
  };
});

vi.mock('../../../src/controllers/auth.controller', async() => {
  const actual: object = await vi.importActual('../../../src/controllers/auth.controller');

  return {
    ...actual,
    checkIpAndAttempt: authControllerHoisted.checkIpAndAttempt
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
      // eslint-disable-next-line no-console
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('should successfully reset pasword', async() => {
    const body = {
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
});
