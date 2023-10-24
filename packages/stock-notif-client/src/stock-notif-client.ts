import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import Axios from 'axios-observable';

/** */
/**
 * StockNotifClient class is responsible for handling stock notifications.
 * It uses an instance of Axios to make HTTP requests and an instance of EhttpController to handle HTTP responses.
 */
export class StockNotifClient {
  static logger = new LoggerController();
  static ehttp: EhttpController;

  /**
   * Creates an instance of StockNotifClient.
   * @param {Axios} axiosInstance - An instance of Axios to make HTTP requests.
   */
  constructor(
    axiosInstance: Axios
  ) {
    StockNotifClient.ehttp = new EhttpController(axiosInstance);
  }
}
