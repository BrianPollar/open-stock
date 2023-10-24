/* eslint-disable @typescript-eslint/ban-ts-comment */
// import { EmailHandler } from '../../../stock-notif-server/src/index';
import express from 'express';
import { runStockAuthServer, IStockAuthServerConfig, IaAuth, IlocalEnv, IlAuth, IlocalPath, StockAuthServer } from '../../../stock-auth-server/src/stock-auth-server';
import { vi, beforeAll, afterAll, it, describe, expect, expectTypeOf } from 'vitest';
import { apiRouter, disconnectMongoose, runPassport } from '@open-stock/stock-universal-server';
import * as http from 'http';
import { createExpressServer } from '../../helpers';

const openStockAuthServerHoisted = vi.hoisted(() => {
  return {
    runPassport: vi.fn()
  };
});

vi.mock('@open-stock/stock-universal-server', async() => {
  const actual = await vi.importActual('@open-stock/stock-universal-server');
  return {
    // @ts-ignore
    ...actual,
    runPassport: openStockAuthServerHoisted.runPassport
  };
});

const emailHandlerMock = {

} as any;

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

describe('runStockAuthServer', () => {
  let app: express.Application;
  let authRoutes: express.Router;
  let server: http.Server;

  beforeAll(async() => {
    app = createExpressServer();
    authRoutes = await runStockAuthServer(config, emailHandlerMock, app);
    apiRouter.use('/auth', authRoutes);
    app.use('/api', apiRouter);
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

  it('express locals should be defined', () => {
    const keys = [
      'absolutepath',
      'photoDirectory',
      'videoDirectory'
    ];
    keys.forEach(key => {
      expect(app.locals[key]).toBeDefined();
    });
  });

  it('should call runPassport function', () => {
    expect(runPassport).toHaveBeenCalled();
  });

  it('stockAuthServer should be defined', () => {
    const stockAuthServer = app.locals.stockAuthServer;
    expect(stockAuthServer).toBeDefined();
    expect(stockAuthServer).toBeInstanceOf(StockAuthServer);
    expect(stockAuthServer.aAuth).toBeDefined();
    expect(stockAuthServer.lAuth).toBeDefined();
    expect(stockAuthServer.localEnv).toBeDefined();
    expect(stockAuthServer.locaLMailHandler).toBeDefined();
    // expect(databaseConfigUrl).toBeDefined();
  });
});
