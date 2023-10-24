import { EhttpController, LoggerController } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
/** */
export declare class StockNotifClient {
    static logger: LoggerController;
    static ehttp: EhttpController;
    constructor(axiosInstance: Axios);
}
