import { StockAuthClient } from '@open-stock/stock-auth-client';
import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import Axios from 'axios-observable';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

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

      'X-Custom-Header': 'foobar',

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
