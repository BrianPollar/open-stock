import { EhttpController, LoggerController } from '@open-stock/stock-universal';
/**
 * StockAuthClient is a class that provides methods for authenticating with the stock service.
 */
export class StockAuthClient {
    /**
     * Creates an instance of StockAuthClient.
     * @param axiosInstance An instance of Axios used for making HTTP requests.
     */
    constructor(axiosInstance) {
        StockAuthClient.ehttp = new EhttpController(axiosInstance);
    }
}
/**
 * logger: A static property of type LoggerController.
 * It is used for logging messages related to the stock authentication client.
 */
StockAuthClient.logger = new LoggerController();
//# sourceMappingURL=stock-auth-client.js.map