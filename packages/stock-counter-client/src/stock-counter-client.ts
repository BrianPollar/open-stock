import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
import { CalculationsController } from './utils/calculations';

export let stockCounterClient: StockCounterClient;


export class StockCounterClient {
  static calcCtrl = new CalculationsController();
  static logger = new LoggerController();
  static ehttp: EhttpController;

  /**
   * Creates an instance of the StockCounterClient class.
   * @param axiosInstance The Axios instance to be used for HTTP requests.
   */
  constructor(axiosInstance: Axios) {
    StockCounterClient.ehttp = new EhttpController(axiosInstance);
  }
}

/**
 * Creates a stock counter client.
 * @param axiosInstance - The Axios instance to use for HTTP requests.
 * @returns An object containing the stock counter client.
 */
export const createStockCounter = (axiosInstance: Axios) => {
  stockCounterClient = new StockCounterClient(axiosInstance);

  return { stockCounterClient };
};
