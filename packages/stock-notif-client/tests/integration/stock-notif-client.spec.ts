import { StockNotifClient } from '../../src/stock-notif-client';
import { Axios } from 'axios-observable';
import { of } from 'rxjs';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('StockNotifClient', () => {
  let stockNotifClient: StockNotifClient;
  const axiosMock = {
    get: vi.fn().mockImplementation(() => of(null)),
    post: vi.fn().mockImplementation(() => of(null)),
    put: vi.fn().mockImplementation(() => of(null)),
    delete: vi.fn().mockImplementation(() => of(null))
  } as unknown as Axios;

  beforeEach(() => {
    stockNotifClient = new StockNotifClient(axiosMock);
  });

  it('should create an instance of StockNotifClient', () => {
    expect(stockNotifClient).toBeInstanceOf(StockNotifClient);
  });

  it('should set the axios instance', () => {
    expect(StockNotifClient.ehttp).toBeDefined();
    expect(StockNotifClient.ehttp.axiosInstance).toBe(axiosMock);
  });
});
