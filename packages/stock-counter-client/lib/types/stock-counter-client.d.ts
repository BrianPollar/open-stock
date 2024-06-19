import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
import { CalculationsController } from './controllers/calculations.controller';
export declare let stockCounterClient: StockCounterClient;
export declare class StockCounterClient {
    static calcCtrl: CalculationsController;
    static logger: LoggerController;
    static ehttp: EhttpController;
    /**
     * Creates an instance of the StockCounterClient class.
     * @param axiosInstance The Axios instance to be used for HTTP requests.
     */
    constructor(axiosInstance: Axios);
}
/**
 * Creates a stock counter client.
 * @param axiosInstance - The Axios instance to use for HTTP requests.
 * @returns An object containing the stock counter client.
 */
export declare const createStockCounter: (axiosInstance: Axios) => {
    stockCounterClient: StockCounterClient;
};
