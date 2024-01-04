import Axios from 'axios-observable';
import { vi, afterAll, expect, describe, beforeAll, it } from 'vitest';
import { StockAuthClient } from '@open-stock/stock-auth-client';
import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import { disconnectMongoose } from '@open-stock/stock-universal-server';

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

describe('status integration tests', () => {
  let stockAuthClientInstance: StockAuthClient;
  const axiosInstance = Axios.create({
    baseURL: 'https://yourapi.com',
    timeout: 1000,
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'X-Custom-Header': 'foobar',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: 'auth-token'
    }
  });

  beforeAll(() => {
    stockAuthClientInstance = new StockAuthClient(axiosInstance);
  });

  afterAll(async() => {
    await disconnectMongoose();
  });

  it('can run library', () => {
    expect(stockAuthClientInstance).toBeInstanceOf(StockAuthClient);
  });

  it('can can get ehttp', () => {
    expect(StockAuthClient.ehttp).toBeInstanceOf(EhttpController);
  });

  it('can can get logger', () => {
    expect(StockAuthClient.logger).toBeInstanceOf(LoggerController);
  });
});
