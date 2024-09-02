/* eslint-disable @typescript-eslint/ban-ts-comment */
// import { EmailHandler } from '../../../stock-notif-server/src/index';
import { apiRouter, disconnectMongoose, runPassport } from '@open-stock/stock-universal-server';
import express from 'express';
import * as http from 'http';
import { afterAll, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createExpressServer } from '../../../tests/helpers';
import { IStockAuthServerConfig, IaAuth, IlAuth, IlocalEnv, IlocalPath, runStockAuthServer } from '../../src/stock-auth-server';

const openStockAuthServerHoisted = vi.hoisted(() => {
  return {
    runPassport: vi.fn()
  };
});

vi.mock('@open-stock/stock-universal-server', async() => {
  const actual: object = await vi.importActual('@open-stock/stock-universal-server');

  return {
    ...actual,
    runPassport: openStockAuthServerHoisted.runPassport
  };
});

const appName = 'testApp';
const localPath: IlocalPath = {
  absolutepath: `${process.cwd()}/${appName}`,
  photoDirectory: `${process.cwd()}/${appName}/openphotos/`,
  videoDirectory: `${process.cwd()}/${appName}/openvideos/`
};
const authSecrets: IlAuth = {
  jwtSecret: 'aegwegshhweh',
  cookieSecret: 'ehwerhrewhewrhrhrh'
};
const adminAuth: IaAuth = {
  processadminID: 'admin',
  password: 'admin'
};
const localEnv1: IlocalEnv = {
  production: true,
  appName,
  appOfficialName: 'appOfficialName',
  websiteAddr1: 'websiteAddr1',
  websiteAddr2: 'websiteAddr2'
};
const config: IStockAuthServerConfig = {
  adminAuth,
  authSecrets,
  localSettings: localEnv1,
  databaseConfigUrl: 'mongodb://localhost:27017/node_testyyyyy',
  localPath
};

vi.mock('@open-stock/stock-notif-server', async() => {
  const actual: object = await vi.importActual('@open-stock/stock-notif-server');

  return {
    ...actual,
    isNotificationsServerRunning: vi.fn().mockReturnValue(true)
  };
});

describe('runStockAuthServer', () => {
  let app: express.Application;
  let authRoutes: express.Router;
  let server: http.Server;

  beforeAll(async() => {
    app = createExpressServer();
    authRoutes = await runStockAuthServer(config);
    apiRouter.use('/aoi', apiRouter);
    app.use('/auth', apiRouter);
    server = app.listen(4011, () => {
      console.log('Server has started!');
    });
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('authRoutes should be an express router', () => {
    expectTypeOf(authRoutes).toMatchTypeOf(express.Router);
  });

  it('should call runPassport function', () => {
    expect(runPassport).toHaveBeenCalled();
  });
});
