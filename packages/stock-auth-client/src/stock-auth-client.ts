import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import Axios from 'axios-observable';

/**
 * StockAuthClient is a class that provides methods for authenticating with the stock service.
 */
export class StockAuthClient {
  static ehttp: EhttpController;
  static logger = new LoggerController();

  /**
   * Creates an instance of StockAuthClient.
   * @param axiosInstance An instance of Axios used for making HTTP requests.
   */
  constructor(axiosInstance: Axios) {
    StockAuthClient.ehttp = new EhttpController(axiosInstance);
  }
}
