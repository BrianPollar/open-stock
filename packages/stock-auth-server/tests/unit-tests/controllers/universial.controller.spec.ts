/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { afterAll, vi, beforeAll, describe, it, expect } from 'vitest';
import { Application } from 'express';
import { faker } from '@faker-js/faker/locale/en_US';
import { generateToken, sendTokenEmail, sendTokenPhone, setUserInfo, validateEmail, validatePhone } from '../../../../stock-auth-server/src/controllers/universial.controller';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { createExpressServer } from '../../../../tests/helpers';
// import { updateNotifnViewed } from '../../../../stock-notif-server/src/controllers/notifications.controller';
import * as http from 'http';
import { createNotificationsDatabase } from '@open-stock/stock-notif-server/src/stock-notif-local';
import { authRoutes } from '../../../src/routes/user.routes';
import { Iauthtoken, Iuser } from '@open-stock/stock-universal';
import { createMockCompanyPerm, createMockUser, createMockUserperm } from '../../../../tests/stock-auth-mocks';
import { user } from '../../../src/models/user.model';

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
  const actual: object = await vi.importActual('../../../../stock-notif-server/src/controllers/notifications.controller');
  return {
    ...actual,
    updateNotifnViewed: vi.fn()
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

describe('universial', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  // let app: Application;
  const apiUrl = '/auth';
  // const apiUrlNotif = '/notif';
  let app = Application;
  let server: http.Server;

  beforeAll(async() => {
    app = createExpressServer();
    await createNotificationsDatabase(dbUrl);
    app.use(apiUrl, authRoutes);
    // app.use(apiUrlNotif, notifnRoutes); // TODO
    server = app.listen(4000, () => {
      // eslint-disable-next-line no-console
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('#generateToken should return a success response if the verifycode is valid', () => {
    const config: Iauthtoken = {
      userId: faker.string.uuid(),
      companyId: faker.string.uuid(),
      permissions: createMockUserperm(),
      companyPermissions: createMockCompanyPerm()
    };
    const dateStr = '1d';
    const madeToken = generateToken(config, dateStr, new Date().toString());
    expect(madeToken).toBeDefined();
    expect(typeof madeToken).toBe('string');
  });

  it('#setUserInfo should return a success response if the verifycode is valid', () => {
    const id = faker.string.uuid();
    const perms = createMockUserperm();
    const companyId = faker.string.uuid();
    const companyPerm = createMockCompanyPerm();
    const info = setUserInfo(id, perms, companyId, companyPerm);
    expect(info).toBeDefined();
    expect(typeof info).toBe('object');
    expect(info).toHaveProperty('userId');
    expect(info).toHaveProperty('permissions');
    expect(typeof info.permissions).toBe('object');
  });

  // TODO
  it('#validatePhone should return a success response if the verifycode is valid', async() => {
    const userId = createMockUser() as any;
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

  // TODO
  it('#validateEmail should return a success response if the verifycode is valid', async() => {
    const userId = createMockUser() as any;
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
      findOne: vi.fn()
    } as unknown as typeof user as any;
    const type = 'token';
    const appOfficialName = 'name';
    const sent = await sendTokenEmail(foundUserMock, type, appOfficialName);
    expect(sent).toBeDefined();
    expect(typeof sent).toBe('object');
    expect(sent).toHaveProperty('success');
  });
});

describe('sendTokenEmail', () => {
  const foundUserMock = createMockUser() as unknown as Iuser as any;
  const type = 'token';
  const appOfficialName = 'name';
  // const link = 'http://localhost:4200/verify?id=';

  it('should send a verification email with token', async() => {
    const response = await sendTokenEmail(foundUserMock, type, appOfficialName);
    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    // expect(response.status).toBe(200);
    expect(response.msg).toBeTypeOf('string');
  });

  it('should send a verification email with link', async() => {
    const response = await sendTokenEmail(foundUserMock, '_link', appOfficialName);
    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    // expect(response.status).toBe(200);
    expect(response.msg).toBeTypeOf('string');
  });
});
