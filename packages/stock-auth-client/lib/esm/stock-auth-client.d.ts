import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
/**
 * StockAuthClient is a class that provides methods for authenticating with the stock service.
 */
export declare class StockAuthClient {
    static ehttp: EhttpController;
    static logger: LoggerController;
    /**
     * Creates an instance of StockAuthClient.
     * @param axiosInstance An instance of Axios used for making HTTP requests.
     */
    constructor(axiosInstance: Axios);
}
