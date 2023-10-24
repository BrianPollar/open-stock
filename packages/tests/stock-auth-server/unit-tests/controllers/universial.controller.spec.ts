/* eslint-disable @typescript-eslint/ban-ts-comment */
import { afterAll, vi, beforeAll, describe, it, expect } from 'vitest';
import { Application } from 'express';
import { createMockUserperm } from '../../../mocks';
import { faker } from '@faker-js/faker';
import { generateToken, sendTokenEmail, sendTokenPhone, setUserInfo, validateEmail, validatePhone } from '../../../../stock-auth-server/src/controllers/universial.controller';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../helpers';
import { createNotificationsDatabase } from '@open-stock/stock-notif-server/src/stock-notif-server';
import { notifnRoutes } from '@open-stock/stock-notif-server';
// import { updateNotifnViewed } from '../../../../stock-notif-server/src/controllers/notifications.controller';
import * as http from 'http';
import { authRoutes } from '../../../../stock-auth-server/src/routes/auth.routes';

// hoist authroutes some parts
const universialControllerHoisted = vi.hoisted(() => {
  return {
    generateToken: vi.fn(() => 'token_egwegweg'),
    sendTokenEmail: vi.fn(() => ({
      success: true,
      type: 'string',
      msg: 'string'
    })),
    sendTokenPhone: vi.fn(() => ({
      success: true,
      msg: 'string'
    })),
    setUserInfo: vi.fn(() => ({
      userId: 'egwegwegg',
      permissions: createMockUserperm()
    })),
    validateEmail: vi.fn(() => ({
      status: 200,
      response: {
        success: true,
        msg: 'string'
      }
    })),
    validatePhone: vi.fn(() => ({
      status: 200,
      response: {
        success: true,
        msg: 'string'
      }
    }))
  };
});

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

vi.mock('../../../../stock-notif-server/src/controllers/notifications.controller', async() => {
  const actual = await vi.importActual('../../../../stock-notif-server/src/controllers/notifications.controller');
  return {
    // @ts-ignore
    ...actual,
    updateNotifnViewed: vi.fn()
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

describe('universial', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  // let app: Application;
  const apiUrl = '/auth';
  const apiUrlNotif = '/notif';
  let app = Application;
  let server: http.Server;

  beforeAll(async() => {
    app = createExpressServer();
    await createNotificationsDatabase(dbUrl);
    app.use(apiUrl, authRoutes);
    app.use(apiUrlNotif, notifnRoutes);
    server = app.listen(4000, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('#generateToken should return a success response if the verifycode is valid', () => {
    const config = {
      userId: faker.string.uuid(),
      permissions: createMockUserperm()
    };
    const dateStr = '1d';
    const madeToken = generateToken(config, dateStr, 'dsbsdbsdb');
    expect(madeToken).toBeDefined();
    expect(typeof madeToken).toBe('string');
  });

  it('#setUserInfo should return a success response if the verifycode is valid', () => {
    const id = faker.string.uuid();
    const perms = createMockUserperm();
    const info = setUserInfo(id, perms);
    expect(info).toBeDefined();
    expect(typeof info).toBe('object');
    expect(info).toHaveProperty('userId');
    expect(info).toHaveProperty('permissions');
    expect(typeof info.permissions).toBe('object');
  });

  it('#validatePhone should return a success response if the verifycode is valid', async() => {
    const userId = faker.string.uuid();
    const nowCase = 'password';
    const verifycode = 'code';
    const passwd = 'passwd';
    const validateRes = await validatePhone(userId, nowCase, verifycode, passwd);
    expect(validateRes).toBeDefined();
    expect(typeof validateRes).toBe('object');
    expect(validateRes).toHaveProperty('status');
    expect(validateRes).toHaveProperty('response');
    expect(typeof validateRes.response).toBe('object');
  });

  it('#validateEmail should return a success response if the verifycode is valid', async() => {
    const userId = faker.string.uuid();
    const type = '_link';
    const nowCase = 'password';
    const verifycode = 'code';
    const password = 'password';
    const validateRes = await validateEmail(userId, type, nowCase, verifycode, password);
    expect(validateRes).toBeDefined();
    expect(typeof validateRes).toBe('object');
    expect(validateRes).toHaveProperty('status');
    expect(validateRes).toHaveProperty('response');
    expect(typeof validateRes.response).toBe('object');
  });

  it('#sendTokenPhone should return a success response if the verifycode is valid', async() => {
    const foundUserMock = {

    };
    const sent = await sendTokenPhone(foundUserMock);
    expect(sent).toBeDefined();
    expect(typeof sent).toBe('object');
    expect(sent).toHaveProperty('success');
  });

  it('#sendTokenEmail should return a success response if the verifycode is valid', async() => {
    const foundUserMock = {

    } as any;
    const type = 'token';
    const appOfficialName = 'name';
    const sent = await sendTokenEmail(app, foundUserMock, type, appOfficialName);
    expect(sent).toBeDefined();
    expect(typeof sent).toBe('object');
    expect(sent).toHaveProperty('success');
  });
});

