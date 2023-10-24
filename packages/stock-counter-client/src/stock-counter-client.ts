import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import { CalculationsController } from './controllers/calculations.controller';
import Axios from 'axios-observable';

export let stockCounterClient: StockCounterClient;

/** */
export class StockCounterClient {
  /** */
  static calcCtrl = new CalculationsController();

  /** */
  static logger = new LoggerController();

  /** */
  static ehttp: EhttpController;

  /** */
  constructor(
    axiosInstance: Axios
  ) {
    StockCounterClient.ehttp = new EhttpController(axiosInstance);
  }
}

/** */
export const createStockCounter = (
  axiosInstance: Axios
) => {
  stockCounterClient = new StockCounterClient(axiosInstance);
  return { stockCounterClient };
};
