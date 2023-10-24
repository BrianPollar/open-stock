import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import { CalculationsController } from './controllers/calculations.controller';
import Axios from 'axios-observable';
export declare let stockCounterClient: StockCounterClient;
/** */
export declare class StockCounterClient {
    /** */
    static calcCtrl: CalculationsController;
    /** */
    static logger: LoggerController;
    /** */
    static ehttp: EhttpController;
    /** */
    constructor(axiosInstance: Axios);
}
/** */
export declare const createStockCounter: (axiosInstance: Axios) => {
    stockCounterClient: StockCounterClient;
};
