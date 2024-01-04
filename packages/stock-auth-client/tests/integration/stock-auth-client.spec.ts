import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import { StockAuthClient } from '../../src/stock-auth-client';
import { Axios } from 'axios-observable';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('StockAuthClient', () => {
  let stockAuthClient: StockAuthClient;
  const mockAxios = {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  } as unknown as Axios;

  beforeEach(() => {
    stockAuthClient = new StockAuthClient(mockAxios);
  });

  it('should have a static property ehttp of type EhttpController', () => {
    expect(StockAuthClient.ehttp).toBeInstanceOf(EhttpController);
  });

  it('should have a static property logger of type LoggerController', () => {
    expect(StockAuthClient.logger).toBeInstanceOf(LoggerController);
  });

  it('should create an instance of StockAuthClient with the provided axiosInstance', () => {
    expect(stockAuthClient).toBeInstanceOf(StockAuthClient);
    expect(StockAuthClient.ehttp).toBeInstanceOf(EhttpController);
    expect(StockAuthClient.ehttp.axiosInstance).toBe(mockAxios);
  });
});
