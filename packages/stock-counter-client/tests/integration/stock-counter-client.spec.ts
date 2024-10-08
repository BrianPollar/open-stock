import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
import { beforeEach, describe, expect, it } from 'vitest';
import { CalculationsController } from '../../src/controllers/calculations.controller';
import { StockCounterClient } from '../../src/stock-counter-client';

describe('StockCounterClient', () => {
  let axiosInstance: Axios;

  beforeEach(() => {
    axiosInstance = {} as Axios;
  });

  it('should create an instance of StockCounterClient', () => {
    const stockCounterClient = new StockCounterClient(axiosInstance);

    expect(stockCounterClient).toBeInstanceOf(StockCounterClient);
  });

  it('should have a static calcCtrl property', () => {
    expect(StockCounterClient.calcCtrl).toBeInstanceOf(CalculationsController);
  });

  it('should have a static logger property', () => {
    expect(StockCounterClient.logger).toBeInstanceOf(LoggerController);
  });

  it('should have a static ehttp property', () => {
    expect(StockCounterClient.ehttp).toBeInstanceOf(EhttpController);
  });
});
