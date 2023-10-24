import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import Axios from 'axios-observable';

/**
 * StockAuthClient is a class that provides methods for authenticating with the stock service.
 */
export class StockAuthClient {
  /**
   * ehttp: A static property of type EhttpController.
   * It is used for making HTTP requests to the stock service.
   */
  static ehttp: EhttpController;

  /**
   * logger: A static property of type LoggerController.
   * It is used for logging messages related to the stock authentication client.
   */
  static logger = new LoggerController();

  /**
   * Creates an instance of StockAuthClient.
   * @param axiosInstance An instance of Axios used for making HTTP requests.
   */
  constructor(
    axiosInstance: Axios
  ) {
    StockAuthClient.ehttp = new EhttpController(axiosInstance);
  }
}
